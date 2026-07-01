import { useState } from 'react';
import { post } from '../api/client';
import { formatRupiah } from '../lib/format';
import { useToast, ToastContainer } from '../components/ui/Toast';
import { Spinner } from '../components/ui/Spinner';
import { ExpenseList } from '../components/expense/ExpenseList';

type TabType = 'reset' | 'simulate' | 'manual';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

const EXPENSE_CATEGORIES = ['BAHAN_BAKU', 'GAJI', 'OPERASIONAL', 'LAINNYA'];
const CATERING_STATUSES = ['PENDING', 'CONFIRMED', 'DONE'];

const CATEGORY_LABELS: Record<string, string> = {
  BAHAN_BAKU: 'Bahan Baku',
  GAJI: 'Gaji',
  OPERASIONAL: 'Operasional',
  LAINNYA: 'Lainnya',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  DONE: 'Done',
};

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Terjadi kesalahan';
}

export function DataManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('simulate');
  const { toasts, showToast, dismissToast } = useToast();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Data Management</h1>
        <p className="mt-1 text-sm text-gray-400">
          Kelola data restoran: reset, simulasi, dan entri manual.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-800">
        <TabButton
          active={activeTab === 'simulate'}
          onClick={() => setActiveTab('simulate')}
        >
          Run Simulation
        </TabButton>
        <TabButton
          active={activeTab === 'manual'}
          onClick={() => setActiveTab('manual')}
        >
          Manual Entry
        </TabButton>
        <TabButton
          active={activeTab === 'reset'}
          onClick={() => setActiveTab('reset')}
          danger
        >
          Reset Data
        </TabButton>
      </div>

      {activeTab === 'reset' && (
        <ResetDataSection showToast={showToast} />
      )}
      {activeTab === 'simulate' && (
        <SimulationSection showToast={showToast} />
      )}
      {activeTab === 'manual' && (
        <ManualEntrySection showToast={showToast} />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  const baseClass = 'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px';
  if (active) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClass} ${
          danger
            ? 'border-red-500 text-red-400'
            : 'border-amber-500 text-amber-400'
        }`}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClass} border-transparent text-gray-400 hover:text-white`}
    >
      {children}
    </button>
  );
}

function ResetDataSection({
  showToast,
}: {
  showToast: (type: 'success' | 'error' | 'warning', text: string) => void;
}) {
  const [step, setStep] = useState<'idle' | 'confirm1' | 'confirm2' | 'loading'>('idle');
  const [typeName, setTypeName] = useState('');

  const handleReset = async () => {
    if (typeName !== 'RESET') {
      showToast('error', 'Ketik "RESET" untuk konfirmasi');
      return;
    }
    setStep('loading');
    try {
      const result = await post<ApiResponse<{
        message: string;
        deleted: {
          sales: number;
          trends: number;
          reports: number;
          expenses: number;
          catering: number;
        };
      }>>('/admin/reset-data', { confirm: true });

      showToast(
        'success',
        `Data berhasil direset: ${result.data.deleted.sales} sales, ${result.data.deleted.expenses} expenses, ${result.data.deleted.catering} catering dihapus.`
      );
      setStep('idle');
      setTypeName('');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      showToast('error', getErrorMessage(err));
      setStep('idle');
      setTypeName('');
    }
  };

  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center rounded-xl border border-red-900 bg-red-950/30 p-12">
        <Spinner />
        <span className="ml-3 text-red-300">Menghapus semua data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-red-900 bg-red-950/20 p-6">
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">
          ⚠️
        </span>
        <h2 className="text-lg font-semibold text-red-400">Reset Data</h2>
      </div>

      <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-sm text-red-300">
        <p className="font-semibold">Peringatan: Tindakan ini tidak dapat dibatalkan!</p>
        <p className="mt-2">
          Semua data berikut akan dihapus permanen:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Data penjualan harian (Daily Sales)</li>
          <li>Data pengeluaran bulanan (Monthly Expenses)</li>
          <li>Data pesanan catering (Catering Orders)</li>
          <li>Laporan yang tersimpan (Daily Sales Reports)</li>
          <li>Cache analytics (Sales Trends)</li>
          <li>Data simulasi</li>
        </ul>
        <p className="mt-2 font-semibold">
          Data yang dihapus tidak dapat dipulihkan.
        </p>
      </div>

      {step === 'idle' && (
        <button
          type="button"
          onClick={() => setStep('confirm1')}
          className="w-full rounded-lg bg-red-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-600 min-h-[44px]"
        >
          Mulai Reset Data
        </button>
      )}

      {step === 'confirm1' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Apakah Anda yakin ingin menghapus semua data? Dashboard akan otomatis
            di-refresh setelah reset selesai.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('confirm2')}
              className="flex-1 rounded-lg bg-red-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-600 min-h-[44px]"
            >
              Ya, lanjutkan
            </button>
            <button
              type="button"
              onClick={() => setStep('idle')}
              className="flex-1 rounded-lg bg-gray-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-600 min-h-[44px]"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {step === 'confirm2' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Konfirmasi terakhir: Ketik <code className="rounded bg-gray-800 px-1.5 py-0.5 text-amber-400">RESET</code> di bawah untuk mengonfirmasi.
          </p>
          <input
            type="text"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            placeholder='Ketik "RESET"'
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white min-h-[44px]"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={typeName !== 'RESET'}
              className="flex-1 rounded-lg bg-red-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50 min-h-[44px]"
            >
              Hapus Semua Data
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('idle');
                setTypeName('');
              }}
              className="flex-1 rounded-lg bg-gray-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-600 min-h-[44px]"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SimulationSection({
  showToast,
}: {
  showToast: (type: 'success' | 'error' | 'warning', text: string) => void;
}) {
  const [days, setDays] = useState('90');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState(false);

  const handleSimulate = async (confirm: boolean = false) => {
    setLoading(true);
    setConflict(false);
    try {
      const body: Record<string, unknown> = { days: Number(days) };
      if (startDate) body.startDate = startDate;
      if (confirm) body.confirm = true;

      const result = await post<ApiResponse<{
        message: string;
        inserted: { sales: number; expenses: number; catering: number };
        daysGenerated: number;
      }>>('/admin/simulate', body);

      showToast(
        'success',
        `${result.data.message}: ${result.data.daysGenerated} hari, ${result.data.inserted.expenses} expenses, ${result.data.inserted.catering} catering dibuat.`
      );
    } catch (err: any) {
      const errorObj = err?.message;
      if (
        errorObj?.includes('Data simulasi sudah ada') ||
        errorObj?.includes('SIMULATION_CONFLICT')
      ) {
        setConflict(true);
        showToast('warning', 'Data simulasi sudah ada. Konfirmasi penggantian?');
      } else {
        showToast('error', getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-lg font-semibold text-white">Run Simulation</h2>
      <p className="text-sm text-gray-400">
        Generate data historis restoran yang realistis untuk demonstrasi.
        Mencakup revenue harian, menu sales, pengeluaran bulanan, dan pesanan catering.
      </p>

      <div>
        <label htmlFor="simDays" className="mb-1 block text-sm text-gray-400">
          Jumlah Hari (1-365)
        </label>
        <input
          id="simDays"
          type="number"
          value={days}
          min="1"
          max="365"
          onChange={(e) => setDays(e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white min-h-[44px]"
        />
      </div>

      <div>
        <label htmlFor="simStart" className="mb-1 block text-sm text-gray-400">
          Tanggal Mulai (opsional)
        </label>
        <input
          id="simStart"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white [color-scheme:dark] min-h-[44px]"
        />
        <p className="mt-1 text-xs text-gray-500">
          Kosongkan untuk menggunakan tanggal hari ini mundur sebanyak jumlah hari yang dipilih.
        </p>
      </div>

      {conflict && (
        <div className="rounded-lg border border-yellow-700 bg-yellow-900/30 p-4 text-sm text-yellow-300">
          <p className="font-semibold">Data simulasi sudah ada!</p>
          <p className="mt-1">
            Apakah Anda ingin menghapus data lama dan menggantinya dengan data simulasi baru?
          </p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => handleSimulate(true)}
              disabled={loading}
              className="rounded-lg bg-yellow-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-yellow-600 disabled:opacity-50"
            >
              Ya, ganti data
            </button>
            <button
              type="button"
              onClick={() => setConflict(false)}
              className="rounded-lg bg-gray-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-600"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => handleSimulate(false)}
        disabled={loading || !days || Number(days) < 1}
        className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-50 min-h-[44px]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner /> Menyuntikkan data...
          </span>
        ) : (
          'Jalankan Simulasi'
        )}
      </button>
    </div>
  );
}

function ManualEntrySection({
  showToast,
}: {
  showToast: (type: 'success' | 'error' | 'warning', text: string) => void;
}) {
  const [entryType, setEntryType] = useState<'sales' | 'expenses' | 'catering'>('sales');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <EntryTypeButton
          active={entryType === 'sales'}
          onClick={() => setEntryType('sales')}
        >
          Daily Sales
        </EntryTypeButton>
        <EntryTypeButton
          active={entryType === 'expenses'}
          onClick={() => setEntryType('expenses')}
        >
          Monthly Expenses
        </EntryTypeButton>
        <EntryTypeButton
          active={entryType === 'catering'}
          onClick={() => setEntryType('catering')}
        >
          Catering Orders
        </EntryTypeButton>
      </div>

      {entryType === 'sales' && <SalesForm showToast={showToast} />}
      {entryType === 'expenses' && (
        <div className="space-y-6">
          <ExpenseForm showToast={showToast} />
          <div>
            <h3 className="mb-3 text-lg font-semibold text-white">Daftar Pengeluaran</h3>
            <ExpenseList />
          </div>
        </div>
      )}
      {entryType === 'catering' && <CateringForm showToast={showToast} />}
    </div>
  );
}

function EntryTypeButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-amber-500 text-black'
          : 'bg-gray-800 text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function SalesForm({
  showToast,
}: {
  showToast: (type: 'success' | 'error' | 'warning', text: string) => void;
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [revenue, setRevenue] = useState('');
  const [menuInput, setMenuInput] = useState('');
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addMenuItem = () => {
    const trimmed = menuInput.trim();
    if (!trimmed || menuItems.length >= 10) return;
    if (menuItems.some((i) => i.toLowerCase() === trimmed.toLowerCase())) return;
    setMenuItems([...menuItems, trimmed]);
    setMenuInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (menuItems.length === 0) return;
    setSubmitting(true);
    try {
      const result = await post<ApiResponse<{
        id: string;
        date: string;
        revenue: number;
      }>>('/sales', {
        date,
        revenue: Number(revenue),
        top_menu_items: menuItems,
      });
      showToast('success', `Data penjualan ${result.data.date} berhasil disimpan (${formatRupiah(result.data.revenue)})`);
      setRevenue('');
      setMenuItems([]);
    } catch (err) {
      showToast('error', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const formValid = date && revenue && Number(revenue) > 0 && menuItems.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h3 className="text-lg font-semibold text-white">Daily Sales</h3>

      <div>
        <label htmlFor="salesDate" className="mb-1 block text-sm text-gray-400">Tanggal</label>
        <input
          id="salesDate"
          type="date"
          value={date}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white [color-scheme:dark] min-h-[44px]"
          required
        />
      </div>

      <div>
        <label htmlFor="salesRevenue" className="mb-1 block text-sm text-gray-400">Omset (Rp)</label>
        <input
          id="salesRevenue"
          type="number"
          value={revenue}
          min="1"
          step="1"
          placeholder="Contoh: 2500000"
          onChange={(e) => setRevenue(e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white min-h-[44px]"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-400">Best-selling Menu (1-10)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={menuInput}
            maxLength={50}
            placeholder="Nama menu, tekan Enter"
            onChange={(e) => setMenuInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addMenuItem();
              }
            }}
            disabled={menuItems.length >= 10}
            className="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white min-h-[44px]"
          />
          <button
            type="button"
            onClick={addMenuItem}
            disabled={!menuInput.trim() || menuItems.length >= 10}
            className="rounded bg-gray-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 disabled:opacity-50"
          >
            Tambah
          </button>
        </div>
        {menuItems.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {menuItems.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-sm text-amber-400"
              >
                {item}
                <button
                  type="button"
                  onClick={() => setMenuItems(menuItems.filter((_, idx) => idx !== i))}
                  className="text-amber-400 hover:text-white"
                  aria-label={`Hapus ${item}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!formValid || submitting}
        className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-50 min-h-[44px]"
      >
        {submitting ? 'Menyimpan...' : 'Simpan Data Penjualan'}
      </button>
    </form>
  );
}

function ExpenseForm({
  showToast,
}: {
  showToast: (type: 'success' | 'error' | 'warning', text: string) => void;
}) {
  const now = new Date();
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await post<ApiResponse<{ id: string; category: string; amount: number }>>(
        '/expenses',
        {
          category,
          amount: Number(amount),
          month: Number(month),
          year: Number(year),
        }
      );
      showToast(
        'success',
        `Pengeluaran ${CATEGORY_LABELS[result.data.category] ?? result.data.category} ${formatRupiah(result.data.amount)} berhasil disimpan`
      );
      setAmount('');
    } catch (err) {
      showToast('error', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const formValid = amount && Number(amount) > 0 && month && year;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h3 className="text-lg font-semibold text-white">Monthly Expenses</h3>

      <div>
        <label htmlFor="expCategory" className="mb-1 block text-sm text-gray-400">Kategori</label>
        <select
          id="expCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white min-h-[44px]"
        >
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat] ?? cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="expAmount" className="mb-1 block text-sm text-gray-400">Nominal (Rp)</label>
        <input
          id="expAmount"
          type="number"
          value={amount}
          min="1"
          step="1"
          placeholder="Contoh: 5000000"
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white min-h-[44px]"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expMonth" className="mb-1 block text-sm text-gray-400">Bulan</label>
          <select
            id="expMonth"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white min-h-[44px]"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="expYear" className="mb-1 block text-sm text-gray-400">Tahun</label>
          <input
            id="expYear"
            type="number"
            value={year}
            min="2020"
            max="2100"
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white min-h-[44px]"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!formValid || submitting}
        className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-50 min-h-[44px]"
      >
        {submitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
      </button>
    </form>
  );
}

function CateringForm({
  showToast,
}: {
  showToast: (type: 'success' | 'error' | 'warning', text: string) => void;
}) {
  const [clientName, setClientName] = useState('');
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [totalAmount, setTotalAmount] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await post<ApiResponse<{
        id: string;
        client_name: string;
        total_amount: number;
        status: string;
      }>>('/catering', {
        client_name: clientName,
        order_date: orderDate,
        total_amount: Number(totalAmount),
        status,
        notes: notes || null,
      });
      showToast(
        'success',
        `Pesanan catering dari ${result.data.client_name} (${formatRupiah(result.data.total_amount)}) berhasil disimpan`
      );
      setClientName('');
      setTotalAmount('');
      setNotes('');
      setStatus('PENDING');
    } catch (err) {
      showToast('error', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const formValid = clientName && totalAmount && Number(totalAmount) > 0 && orderDate;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h3 className="text-lg font-semibold text-white">Catering Orders</h3>

      <div>
        <label htmlFor="catClient" className="mb-1 block text-sm text-gray-400">Nama Klien</label>
        <input
          id="catClient"
          type="text"
          value={clientName}
          maxLength={200}
          placeholder="Contoh: PT Sentosa Jaya"
          onChange={(e) => setClientName(e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white min-h-[44px]"
          required
        />
      </div>

      <div>
        <label htmlFor="catDate" className="mb-1 block text-sm text-gray-400">Tanggal Pesanan</label>
        <input
          id="catDate"
          type="date"
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white [color-scheme:dark] min-h-[44px]"
          required
        />
      </div>

      <div>
        <label htmlFor="catAmount" className="mb-1 block text-sm text-gray-400">Nominal (Rp)</label>
        <input
          id="catAmount"
          type="number"
          value={totalAmount}
          min="1"
          step="1"
          placeholder="Contoh: 5000000"
          onChange={(e) => setTotalAmount(e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white min-h-[44px]"
          required
        />
      </div>

      <div>
        <label htmlFor="catStatus" className="mb-1 block text-sm text-gray-400">Status</label>
        <select
          id="catStatus"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white min-h-[44px]"
        >
          {CATERING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="catNotes" className="mb-1 block text-sm text-gray-400">Catatan (opsional)</label>
        <textarea
          id="catNotes"
          value={notes}
          maxLength={1000}
          placeholder="Catatan tambahan..."
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white min-h-[44px]"
        />
      </div>

      <button
        type="submit"
        disabled={!formValid || submitting}
        className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-50 min-h-[44px]"
      >
        {submitting ? 'Menyimpan...' : 'Simpan Pesanan Catering'}
      </button>
    </form>
  );
}
