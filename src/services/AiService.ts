import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalyticsService, type AnalyticsResult } from './AnalyticsService';
import { SettingsService } from './SettingsService';

const AI_TIMEOUT_MS = 60000;

const MOCK_SUMMARY = `📊 Ringkasan Eksekutif

Minggu ini bisnis berjalan stabil dengan catatan positif di akhir pekan. Momentum bagus untuk terus ditingkatkan, terutama dengan potensi catering yang mulai terlihat.

💰 Analisis Pendapatan

Omset harian cukup stabil dan ada peningkatan di akhir pekan — tanda baik. Coba perhatikan faktor yang bikin hari ramai biar bisa diterapkan di hari biasa.

💸 Analisis Pengeluaran

Pengeluaran masih dalam batas wajar. Tips kecil: jaga rasio pengeluaran vs pendapatan tetap di bawah 50% supaya margin tetap sehat.

🍱 Analisis Catering

Pesanan catering lumayan, jangan sampai ada yang kelewat pantauannya. Masih ada ruang untuk ekspansi ke kantor atau acara.

💡 Rekomendasi Bisnis

• Stok bahan untuk menu terlaris jangan sampai habis
• Menu yang sepi peminat bisa dipromosikan atau diganti
• Catering cocok buat diandalkan ke kantor & acara

⚠️ Potensi Risiko

• Jangan terlalu bergantung ke 1–2 menu saja, variasi itu penting
• Manajemen stok jangan kendor pas hari sepi vs ramai

Ini contoh ringkasan demo. Hubungkan API key Gemini di pengaturan untuk analisis nyata berdasarkan data restoran kamu.`

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
    if (
      error.message?.includes('NOT_FOUND') ||
      error.message?.includes('model') ||
      error.message?.includes('404')
    ) {
      return 'Model Gemini tidak ditemukan atau tidak tersedia. Pilih model lain di Settings.';
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

    return `Kamu adalah partner bisnis restoran yang santai tapi paham angka. Tugas kamu: baca data restoran di bawah, lalu bikin ringkasan yang enak dibaca di aplikasi dashboard — bukan laporan kantor yang kaku.

Aturan penulisan (WAJIB diikuti):
1. Gunakan Bahasa Indonesia yang ramah dan natural, seperti ngobrol sama rekan bisnis. Hindari kata-kata kaku seperti "Berdasarkan data yang tersedia", "tercatat", "disarankan", "optimalisasi", "implementasi", "efisiensi", "strategi", "maksimalisasi".
2. Setiap section cukup pakai emoji di depan judul, tulis judulnya di baris sendiri. JANGAN gunakan bold markdown (**) atau heading markdown (##).
3. Tiap poin cukup 1–2 kalimat pendek. Jangan paragraf panjang. Gunakan bullet point (•) tanpa indentasi, bukan angka.
4. Kalau ada angka, sertakan dan jelaskan dengan bahasa manusiawi. Misalnya: "Omset naik 20% dari minggu lalu — naik nih!" atau "Pengeluaran hampir 60% dari omset, perlu diperhatiin ya."
5. Kasih 1–2 emoji relevan di dalam isi kalau pas, jangan berlebihan.
6. Jangan pakai tabel, jangan pakai indentasi aneh.
7. Total panjang ringkasan maksimal 25–30 baris.
8. Gunakan bahasa yang membangun semangat owner restoran, jangan nge-judge atau bikin panik.
9. Penjelasan tiap section harus profesional, tidak terlalu singkat dan tidak terlalu panjang. Cukup 3–5 kalimat yang padat dan berbobot, langsung ngasih insight yang bisa ditindaklanjuti.

Format section yang diharapkan (urutannya harus sama):

📊 Ringkasan Eksekutif
Judul di baris sendiri. Tulis 3–5 kalimat yang menggambarkan kondisi bisnis secara keseluruhan: performa omset, tren pengeluaran, dan catatan penting lainnya. Berikan gambaran singkat tapi berbobot, dan tutup dengan semangat untuk periode berikutnya.

💰 Analisis Pendapatan
Bahas omset total, rata-rata harian, dan tren naik/turun periode ini. Jelaskan faktor apa yang mungkin mempengaruhi, misalnya hari ramai, menu populer, atau promo. Bahasa santai tapi tetap profesional.

💸 Analisis Pengeluaran
Bahas total pengeluaran, rasio pengeluaran terhadap pendapatan, serta kondisi laba atau rugi. Berikan konteks angkanya dalam bahasa manusiawi, misalnya margin masih sehat atau perlu diperketat.

🍱 Analisis Catering
Sebut total pesanan catering, status distribusi, dan kontribusinya terhadap omset. Kalau volumenya masih kecil, sampaikan sebagai peluang yang terbuka lebar, bukan kekurangan.

💡 Rekomendasi Bisnis
4–5 bullet point konkret dan bisa langsung dikerjain. Bukan teori, tapi langkah praktis yang sesuai dengan data saat ini.

⚠️ Potensi Risiko
3–4 bullet point yang menyoroti hal perlu diwaspadai, tanpa membuat panik. Fokus pada antisipasi, bukan kritik.

Menu terlaris boleh disinggung di Ringkasan Eksekutif atau Analisis Pendapatan kalau relevan, tidak usah dibuatkan section sendiri.

---

Data Restoran:
- Nama: ${outlet.name}
- Periode: ${period.start} s/d ${period.end}
- Total Omset: ${formatRupiah(summary.totalRevenue)}
- Hari Operasional: ${summary.dayCount} hari
- Rata-rata Harian: ${formatRupiah(summary.averageDaily)}
- Total Pengeluaran: ${formatRupiah(summary.totalExpenses)}
- Laba/Rugi: ${formatRupiah(summary.profitLoss)} (${summary.isLoss ? 'RUGI' : 'UNTUNG'})

Tren Pendapatan (5 hari terbaru):
${revenueTrendStr || '- Tidak ada data'}

Menu Terlaris:
${topMenuStr || '- Tidak ada data menu'}

Pesanan Catering:
- Total: ${formatRupiah(summary.catering?.totalAmount ?? 0)}
- Jumlah: ${summary.catering?.totalCount ?? 0} pesanan
${cateringStr}

---

Sekarang tulis ringkasan sesuai aturan di atas. Langsung isi, jangan ada salam pembuka atau penutup formal.`;
  }
}
