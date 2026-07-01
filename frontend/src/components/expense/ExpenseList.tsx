import { useState, useMemo } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { useToast } from '../ui/Toast';
import { Spinner } from '../ui/Spinner';
import { formatRupiah } from '../../lib/format';
import {
  EXPENSE_CATEGORIES,
  CATEGORY_LABELS,
  type MonthlyExpense,
} from '../../types/expense';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Terjadi kesalahan';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

type SortField = 'created_at' | 'amount' | 'year' | 'month';
type SortOrder = 'asc' | 'desc';

export function ExpenseList() {
  const { expenses, loading, error, deleteExpense, updateExpense } = useExpenses();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    category: '',
    amount: '',
    month: '1',
    year: String(new Date().getFullYear()),
  });
  const [submitting, setSubmitting] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedExpenses = useMemo(() => {
    const sorted = [...expenses];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'amount':
          cmp = a.amount - b.amount;
          break;
        case 'year':
          cmp = a.year - b.year;
          break;
        case 'month':
          cmp = a.month - b.month;
          break;
        case 'created_at':
        default:
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [expenses, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const startEdit = (expense: MonthlyExpense) => {
    setEditingId(expense.id);
    setEditForm({
      category: expense.category,
      amount: String(expense.amount),
      month: String(expense.month),
      year: String(expense.year),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      category: '',
      amount: '',
      month: '1',
      year: String(new Date().getFullYear()),
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    try {
      await updateExpense(editingId, {
        category: editForm.category,
        amount: Number(editForm.amount),
        month: Number(editForm.month),
        year: Number(editForm.year),
      });
      showToast('success', 'Pengeluaran berhasil diperbarui');
      cancelEdit();
    } catch (err) {
      showToast('error', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (expense: MonthlyExpense) => {
    if (!confirm(
      `Hapus pengeluaran ${CATEGORY_LABELS[expense.category] ?? expense.category} ` +
      `${formatRupiah(expense.amount)} untuk ${MONTH_NAMES[expense.month - 1]} ${expense.year}?`
    )) {
      return;
    }
    try {
      await deleteExpense(expense.id);
      showToast('success', 'Pengeluaran berhasil dihapus');
    } catch (err) {
      showToast('error', getErrorMessage(err));
    }
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-white transition-colors"
    >
      {children}
      {sortField === field && (
        <span aria-hidden="true">{sortOrder === 'asc' ? '↑' : '↓'}</span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-800 bg-gray-900 p-12">
        <Spinner />
        <span className="ml-3 text-gray-400">Memuat pengeluaran...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
        <div className="text-4xl" aria-hidden="true">💸</div>
        <p className="mt-2 text-sm text-gray-400">Belum ada data pengeluaran</p>
        <p className="mt-1 text-xs text-gray-600">
          Tambahkan pengeluaran melalui form di tab Manual Entry
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {editingId && (
        <form
          onSubmit={handleUpdate}
          className="rounded-xl border border-amber-700 bg-amber-950/20 p-4 space-y-4"
        >
          <h4 className="text-sm font-semibold text-amber-400">Edit Pengeluaran</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Kategori</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-white min-h-[40px]"
                required
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] ?? cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Nominal (Rp)</label>
              <input
                type="number"
                value={editForm.amount}
                min="1"
                step="1"
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-white min-h-[40px]"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Bulan</label>
              <select
                value={editForm.month}
                onChange={(e) => setEditForm({ ...editForm, month: e.target.value })}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-white min-h-[40px]"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Tahun</label>
              <input
                type="number"
                value={editForm.year}
                min="2020"
                max="2100"
                onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-white min-h-[40px]"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg bg-gray-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-600"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3">
                <SortHeader field="created_at">Tanggal Dibuat</SortHeader>
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400">Kategori</th>
              <th className="px-4 py-3">
                <SortHeader field="amount">Nominal</SortHeader>
              </th>
              <th className="px-4 py-3">
                <SortHeader field="month">Periode</SortHeader>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-gray-800/50 transition-colors hover:bg-gray-800/30"
              >
                <td className="px-4 py-3 text-gray-400">
                  {formatDate(expense.created_at)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300">
                    {CATEGORY_LABELS[expense.category] ?? expense.category}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-orange-400">
                  {formatRupiah(expense.amount)}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {MONTH_NAMES[expense.month - 1]} {expense.year}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(expense)}
                      className="rounded bg-gray-700 px-2.5 py-1 text-xs text-white transition-colors hover:bg-gray-600"
                      aria-label="Edit pengeluaran"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(expense)}
                      className="rounded bg-red-800/50 px-2.5 py-1 text-xs text-red-400 transition-colors hover:bg-red-800 hover:text-white"
                      aria-label="Hapus pengeluaran"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-800">
              <td className="px-4 py-3 text-xs text-gray-500" colSpan={2}>
                Total: {expenses.length} pengeluaran
              </td>
              <td className="px-4 py-3 font-semibold text-orange-400">
                {formatRupiah(
                  expenses.reduce((sum, e) => sum + e.amount, 0)
                )}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
