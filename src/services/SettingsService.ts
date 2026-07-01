import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SettingsRepository } from '../repositories/SettingsRepository';

const ENCRYPTION_KEY = process.env.JWT_SECRET || 'default-secret-key-change-me';
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro'] as const;

function encrypt(text: string): string {
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string): string {
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return '';
  }
}

export interface GeminiConfigStatus {
  configured: boolean;
  source: 'database' | 'env' | 'none';
  model: string;
  lastUpdated: string | null;
  maskedKey: string | null;
}

export interface GeminiTestResult {
  success: boolean;
  message: string;
}

export class SettingsService {
  private repo: SettingsRepository;

  constructor(repo?: SettingsRepository) {
    this.repo = repo ?? new SettingsRepository();
  }

  async getGeminiConfig(outlet_id: string): Promise<GeminiConfigStatus> {
    const keySetting = await this.repo.get(outlet_id, 'gemini_api_key');
    const modelSetting = await this.repo.get(outlet_id, 'gemini_model');

    let source: 'database' | 'env' | 'none' = 'none';
    let maskedKey: string | null = null;

    if (keySetting) {
      source = 'database';
      const decrypted = decrypt(keySetting.value);
      maskedKey = maskKey(decrypted);
    } else if (process.env.GEMINI_API_KEY) {
      source = 'env';
      maskedKey = maskKey(process.env.GEMINI_API_KEY);
    }

    const model = modelSetting?.value || 'gemini-2.5-flash';

    return {
      configured: source !== 'none',
      source,
      model,
      lastUpdated: keySetting?.updated_at?.toISOString() ?? null,
      maskedKey,
    };
  }

  async saveGeminiKey(outlet_id: string, apiKey: string): Promise<void> {
    if (!apiKey || apiKey.trim().length < 10) {
      throw new Error('API key appears to be invalid (too short)');
    }
    const encrypted = encrypt(apiKey.trim());
    await this.repo.upsert(outlet_id, 'gemini_api_key', encrypted);
  }

  async saveGeminiModel(outlet_id: string, model: string): Promise<void> {
    if (!GEMINI_MODELS.includes(model as typeof GEMINI_MODELS[number])) {
      throw new Error(`Invalid model. Must be one of: ${GEMINI_MODELS.join(', ')}`);
    }
    await this.repo.upsert(outlet_id, 'gemini_model', model);
  }

  async deleteGeminiKey(outlet_id: string): Promise<void> {
    await this.repo.delete(outlet_id, 'gemini_api_key');
  }

  async getDecryptedKey(outlet_id: string): Promise<string | null> {
    const setting = await this.repo.get(outlet_id, 'gemini_api_key');
    if (setting) {
      return decrypt(setting.value) || null;
    }
    return process.env.GEMINI_API_KEY || null;
  }

  async getGeminiModel(outlet_id: string): Promise<string> {
    const setting = await this.repo.get(outlet_id, 'gemini_model');
    return setting?.value || 'gemini-2.5-flash';
  }

  async testConnection(outlet_id: string): Promise<GeminiTestResult> {
    const apiKey = await this.getDecryptedKey(outlet_id);
    if (!apiKey) {
      return {
        success: false,
        message: 'Tidak ada API key yang dikonfigurasi. Tambahkan API key terlebih dahulu.',
      };
    }

    const model = await this.getGeminiModel(outlet_id);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelInstance = genAI.getGenerativeModel({ model });
      const result = await Promise.race([
        modelInstance.generateContent('Respond with just "OK"'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Test request timed out after 10 seconds')), 10000)
        ),
      ]);
      const response = await result.response;
      const text = response.text();
      return {
        success: true,
        message: `Koneksi berhasil. Model: ${model}. Respons: "${text.substring(0, 50)}"`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: getTestErrorMessage(error),
      };
    }
  }

  getAvailableModels() {
    return GEMINI_MODELS;
  }
}

function maskKey(key: string): string {
  if (!key || key.length < 8) return '***';
  return key.substring(0, 4) + '***' + key.substring(key.length - 3);
}

function getTestErrorMessage(error: any): string {
  if (error.message?.includes('timed out')) {
    return 'Koneksi timeout. Periksa koneksi internet atau coba lagi.';
  }
  if (error.message?.includes('API_KEY') || error.message?.includes('PERMISSION_DENIED')) {
    return 'API key tidak valid atau tidak memiliki akses. Periksa kembali API key Anda.';
  }
  if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
    return 'Kuota Gemini API habis. Tunggu beberapa saat sebelum mencoba lagi.';
  }
  if (error.message?.includes('NOT_FOUND') || error.message?.includes('model')) {
    return 'Model tidak ditemukan. Pilih model yang tersedia.';
  }
  return `Koneksi gagal: ${error.message || 'Unknown error'}`;
}
