import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class AiController {
  private genAI: GoogleGenerativeAI | null = null;

  static getInstance(): AiController {
    return new AiController();
  }

  private getGenAI(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  async generateSummary(req: AuthenticatedRequest, res: Response) {
    try {
      const { trends, summary } = req.body;

      if (!trends || !summary) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'trends and summary are required' },
        });
        return;
      }

      const model = this.getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = this.buildPrompt(trends, summary);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.status(200).json({ success: true, data: { summary: text } });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { code: 'AI_ERROR', message: error.message || 'Failed to generate summary' },
      });
    }
  }

  private buildPrompt(trends: any[], summary: any): string {
    const trendsJson = JSON.stringify(trends, null, 2);
    const summaryJson = JSON.stringify(summary, null, 2);

    return `Anda adalah asisten analisis bisnis restoran. Berikut adalah data performa restoran dalam format JSON:

Tren Harian:
${trendsJson}

Ringkasan:
${summaryJson}

Berdasarkan data di atas, buatlah ringkasan performa restoran dalam Bahasa Indonesia dengan format berikut:
1. Ringkasan performa omset secara singkat
2. Menu terlaris yang perlu diperhatikan
3. Rekomendasi singkat untuk meningkatkan performa

Pastikan ringkasan maksimal 3 paragraf dan menggunakan Bahasa Indonesia yang baik dan mudah dipahami.`;
  }
}
