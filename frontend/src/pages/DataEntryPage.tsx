import { useState } from 'react';
import { post } from '../api/client';
import { formatRupiah } from '../lib/format';

interface SalesResponse {
  success: boolean;
  data: {
    id: string;
    date: string;
    revenue: number;
    top_menu_items: string[];
    data_source: string;
  };
}

interface DummyResponse {
  success: boolean;
  data: {
    injectedCount: number;
    outletId: string;
  };
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Terjadi kesalahan';
}

export function DataEntryPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [revenue, setRevenue] = useState('');
  const [menuInput, setMenuInput] = useState('');
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [dummyDays, setDummyDays] = useState('365');
  const [dummyConfirm, setDummyConfirm] = useState(false);
  const [dummySubmitting, setDummySubmitting] = useState(false);

  const addMenuItem = () => {
    const trimmed = menuInput.trim();
    if (!trimmed) return;
    if (menuItems.length >= 10) return;
    if (menuItems.some((item) => item.toLowerCase() === trimmed.toLowerCase())) return;
    setMenuItems([...menuItems, trimmed]);
    setMenuInput('');
  };

  const removeMenuItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMenuItem();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (menuItems.length === 0) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const result = await post<SalesResponse>('/sales', {
        date,
        revenue: Number(revenue),
        top_menu_items: menuItems,
      });
      setMessage({
        type: 'success',
        text: `Data penjualan ${result.data.date} berhasil disimpan (${formatRupiah(result.data.revenue)})`,
      });
      setRevenue('');
      setMenuItems([]);
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDummyInject = async () => {
    if (!dummyConfirm) return;
    setDummySubmitting(true);
    setMessage(null);
    try {
      const result = await post<DummyResponse>('/admin/dummy-inject', {
        days: Number(dummyDays),
        confirm: true,
      });
      setMessage({
        type: 'success',
        text: `${result.data.injectedCount} hari data simulasi berhasil dibuat`,
      });
      setDummyConfirm(false);
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setDummySubmitting(false);
    }
  };

  const formValid = date && revenue && Number(revenue) > 0 && menuItems.length > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-white">Input Data Penjualan</h1>

      {/* Feedback banner */}
      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            message.type === 'success'
              ? 'border border-green-700 bg-green-900/50 text-green-300'
              : 'border border-red-700 bg-red-900/50 text-red-300'
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {/* Manual Entry Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-white">Entri Manual</h2>

        <div>
          <label htmlFor="date" className="mb-1 block text-sm text-gray-400">
            Tanggal
          </label>
          <input
            id="date"
            type="date"
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white [color-scheme:dark] min-h-[44px]"
            required
          />
        </div>

        <div>
          <label htmlFor="revenue" className="mb-1 block text-sm text-gray-400">
            Omset (Rp)
          </label>
          <input
            id="revenue"
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
          <label className="mb-1 block text-sm text-gray-400">
            Menu Terlaris (1-10 item)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={menuInput}
              maxLength={50}
              placeholder="Nama menu, tekan Enter"
              onChange={(e) => setMenuInput(e.target.value)}
              onKeyDown={handleMenuKeyDown}
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
                    onClick={() => removeMenuItem(i)}
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

      {/* Dummy Data Injector */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Suntik Data Simulasi</h2>
        <p className="text-sm text-gray-400">
          Buat data penjualan simulasi untuk 365 hari terakhir. Data yang sudah
          ada tidak akan ditimpa.
        </p>

        <div>
          <label htmlFor="dummyDays" className="mb-1 block text-sm text-gray-400">
            Jumlah Hari
          </label>
          <input
            id="dummyDays"
            type="number"
            value={dummyDays}
            min="1"
            max="365"
            onChange={(e) => setDummyDays(e.target.value)}
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white min-h-[44px]"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={dummyConfirm}
            onChange={(e) => setDummyConfirm(e.target.checked)}
            className="mt-0.5 h-4 w-4"
          />
          <span className="text-sm text-gray-400">
            Saya mengerti bahwa data simulasi akan digunakan untuk keperluan demo
          </span>
        </label>

        <button
          type="button"
          onClick={handleDummyInject}
          disabled={!dummyConfirm || dummySubmitting}
          className="w-full rounded-lg bg-gray-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-600 disabled:opacity-50 min-h-[44px]"
        >
          {dummySubmitting ? 'Menyuntikkan data...' : 'Suntik Data Simulasi'}
        </button>
      </div>
    </div>
  );
}
