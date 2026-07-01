import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalyticsService, type AnalyticsResult } from './AnalyticsService';
import { SettingsService } from './SettingsService';

const AI_TIMEOUT_MS = 60000;

const MOCK_SUMMARY = `## Ringkasan Eksekutif
Berdasarkan data yang tersedia, performa bisnis restoran menunjukkan tren yang perlu diperhatikan.

## Analisis Pendapatan
Omset harian menunjukkan fluktuasi wajar dengan peningkatan pada akhir pekan. Fluktuasi ini normal untuk bisnis restoran.

## Analisis Pengeluaran
Pengeluaran bulanan tercatat per kategori. Pastikan rasio pengeluaran terhadap pendapatan tetap di bawah 50% untuk menjaga profitabilitas.

## Analisis Catering
Pesanan catering merupakan sumber pendapatan tambahan yang signifikan. Pantau status pesanan agar tidak ada yang terlewat.

## Rekomendasi Bisnis
1. Pertahankan konsistensi menu terlaris dan pastikan stok bahan baku selalu tersedia.
2. Evaluasi menu dengan penjualan rendah untuk promo atau penggantian.
3. Tingkatkan promosi catering untuk acara kantor dan perayaan.

## Potensi Risiko
1. Fluktuasi pendapatan di hari biasa vs akhir pekan perlu diantisipasi dengan manajemen stok yang tepat.
2. Ketergantungan pada menu tertentu dapat menjadi risiko jika terjadi kenaikan harga bahan baku.

_Catatan: Ringkasan ini dihasilkan dalam mode demo (mock). Hubungkan GEMINI_API_KEY untuk mendapatkan analisis AI yang sebenarnya._`;

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export interface AiSummaryResult {
  summary: string;
  isMock: boolean;
  noData?: boolean;
  error?: string;
  message?: string;
}

export class AiService {
  private analyticsService: AnalyticsService;
  private settingsService: SettingsService;
  private genAI: GoogleGenerativeAI | null = null;
  private genAIKey: string | null = null;
  private genAIOutletId: string | null = null;
  private pendingRequest: Promise<AiSummaryResult> | null = null;
  private lastRequestKey: string = '';

  constructor(analyticsService?: AnalyticsService) {
    this.analyticsService = analyticsService ?? new AnalyticsService();
    this.settingsService = new SettingsService();
  }

  private async getGenAI(outletId: string): Promise<GoogleGenerativeAI | null> {
    const apiKey = await this.settingsService.getDecryptedKey(outletId);
    if (!apiKey || apiKey.trim() === '') {
      return null;
    }
    if (this.genAI && this.genAIKey === apiKey && this.genAIOutletId === outletId) {
      return this.genAI;
    }
    this.genAI = new GoogleGenerativeAI(apiKey.trim());
    this.genAIKey = apiKey;
    this.genAIOutletId = outletId;
    return this.genAI;
  }

  async generateSummary(
    outletId: string,
    start: string,
    end: string
  ): Promise<AiSummaryResult> {
    try {
      const analytics = await this.analyticsService.getAggregatedData(
        outletId,
        start,
        end
      );

      if (analytics.summary.dayCount === 0) {
        return {
          summary:
            'Tidak ada data untuk periode ini. Silakan pilih rentang tanggal yang memiliki data atau jalankan simulasi data.',
          isMock: false,
          noData: true,
        };
      }

      const genAI = await this.getGenAI(outletId);
      if (!genAI) {
        return {
          summary: MOCK_SUMMARY,
          isMock: true,
          message: 'GEMINI_API_KEY tidak dikonfigurasi. Menampilkan ringkasan demo.',
        };
      }

      const modelName = await this.settingsService.getGeminiModel(outletId);
      const prompt = this.buildPrompt(analytics);

      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await this.withTimeout(
          model.generateContent(prompt),
          AI_TIMEOUT_MS
        );
        const response = await result.response;
        const text = response.text();

        if (!text || text.trim().length < 10) {
          return {
            summary: MOCK_SUMMARY,
            isMock: true,
            error: 'Respons AI kosong atau terlalu pendek.',
            message:
              'Ringkasan AI tidak dapat dibuat. Menampilkan ringkasan demo.',
          };
        }

        return { summary: text.trim(), isMock: false };
      } catch (aiError: any) {
        return {
          summary: MOCK_SUMMARY,
          isMock: true,
          error: this.getFriendlyErrorMessage(aiError),
          message:
            'Ringkasan AI gagal dibuat. Menampilkan ringkasan demo.',
        };
      }
    } catch (error: any) {
      return {
        summary: 'Terjadi kesalahan saat mengambil data untuk ringkasan AI. Silakan coba lagi.',
        isMock: true,
        error: error.message || 'Unknown error',
        message: 'Gagal mengambil data analitik.',
      };
    }
  }

  async generateSummaryDeduplicated(
    outletId: string,
    start: string,
    end: string
  ): Promise<AiSummaryResult> {
    const requestKey = `${outletId}:${start}:${end}`;

    if (this.pendingRequest && this.lastRequestKey === requestKey) {
      return this.pendingRequest;
    }

    this.lastRequestKey = requestKey;
    this.pendingRequest = this.generateSummary(outletId, start, end);

    try {
      const result = await this.pendingRequest;
      return result;
    } finally {
      this.pendingRequest = null;
    }
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('AI_REQUEST_TIMEOUT'));
      }, ms);
      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  private getFriendlyErrorMessage(error: any): string {
    if (error.message === 'AI_REQUEST_TIMEOUT') {
      return 'Permintaan AI melebihi batas waktu. Silakan coba lagi.';
    }
    if (
      error.message?.includes('quota') ||
      error.message?.includes('RESOURCE_EXHAUSTED')
    ) {
      return 'Kuota Gemini API telah habis. Silakan coba lagi nanti.';
    }
    if (
      error.message?.includes('API_KEY') ||
      error.message?.includes('PERMISSION_DENIED')
    ) {
      return 'Akses Gemini API ditolak. Periksa konfigurasi API key.';
    }
    if (error.message?.includes('SAFETY')) {
      return 'Konten respons AI diblokir oleh filter keamanan. Silakan coba lagi.';
    }
    return `Terjadi kesalahan: ${error.message || 'unknown error'}. Dashboard tetap berfungsi normal.`;
  }

  private buildPrompt(analytics: AnalyticsResult): string {
    const { summary, period, outlet, trends } = analytics;

    const topMenuStr = summary.topMenuItems
      .slice(0, 5)
      .map((m) => `- ${m.name}: ${m.count} kali terjual (${m.percentage}%)`)
      .join('\n');

    const cateringStr = summary.catering?.byStatus?.length
      ? summary.catering.byStatus
          .map(
            (s) => `- ${s.status}: ${s.count} pesanan (${formatRupiah(s.total)})`
          )
          .join('\n')
      : '- Tidak ada pesanan catering';

    const revenueTrendStr = trends
      .slice(0, 5)
      .map((t) => `- ${t.date.slice(0, 10)}: ${formatRupiah(t.revenue)}`)
      .join('\n');

    return `Anda adalah asisten analisis bisnis restoran kecil-menengah di Indonesia. Berikan analisis dalam Bahasa Indonesia yang mudah dipahami.

## Data Restoran
- Nama: ${outlet.name}
- Periode: ${period.start} s/d ${period.end}
- Total Omset: ${formatRupiah(summary.totalRevenue)}
- Hari Operasional: ${summary.dayCount} hari
- Rata-rata Harian: ${formatRupiah(summary.averageDaily)}
- Total Pengeluaran: ${formatRupiah(summary.totalExpenses)}
- Laba/Rugi: ${formatRupiah(summary.profitLoss)} (${summary.isLoss ? 'RUGI' : 'UNTUNG'})

## Tren Pendapatan (5 hari terbaru)
${revenueTrendStr || '- Tidak ada data'}

## Menu Terlaris
${topMenuStr || '- Tidak ada data menu'}

## Pesanan Catering
- Total: ${formatRupiah(summary.catering?.totalAmount ?? 0)}
- Jumlah: ${summary.catering?.totalCount ?? 0} pesanan
${cateringStr}

Berdasarkan data di atas, buatlah ringkasan performa bisnis dengan format:

## Ringkasan Eksekutif
## Analisis Pendapatan
## Analisis Pengeluaran
## Analisis Catering
## Rekomendasi Bisnis
## Potensi Risiko`;
  }
}
