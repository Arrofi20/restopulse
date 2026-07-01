import { useState, useMemo } from 'react';
import { useCatering } from '../../hooks/useCatering';
import { useToast } from '../ui/Toast';
import { Spinner } from '../ui/Spinner';
import { CateringStatusBadge } from './CateringStatusBadge';
import { formatRupiah } from '../../lib/format';
import type { CateringOrder } from '../../types/catering';
import { CATERING_STATUSES, STATUS_LABELS } from '../../types/catering';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Terjadi kesalahan';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

type SortField = 'order_date' | 'total_amount' | 'client_name' | 'status';
type SortOrder = 'asc' | 'desc';

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  DONE: 2,
};

export function CateringList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { orders, loading, error, updateStatus, updateOrder, deleteOrder } =
    useCatering(debouncedSearch);
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    client_name: '',
    order_date: '',
    total_amount: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [sortField, setSortField] = useState<SortField>('order_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const onSearchChange = (value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => setDebouncedSearch(value), 300);
    return () => clearTimeout(timer);
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...orders];

    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'total_amount':
          cmp = a.total_amount - b.total_amount;
          break;
        case 'client_name':
          cmp = a.client_name.localeCompare(b.client_name);
          break;
        case 'status':
          cmp = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0);
          break;
        case 'order_date':
        default:
          cmp = new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [orders, sortField, sortOrder, statusFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const startEdit = (order: CateringOrder) => {
    setEditingId(order.id);
    setEditForm({
      client_name: order.client_name,
      order_date: order.order_date.slice(0, 10),
      total_amount: String(order.total_amount),
      notes: order.notes ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ client_name: '', order_date: '', total_amount: '', notes: '' });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    try {
      await updateOrder(editingId, {
        client_name: editForm.client_name,
        order_date: editForm.order_date,
        total_amount: Number(editForm.total_amount),
        notes: editForm.notes || null,
      });
      showToast('success', 'Pesanan catering berhasil diperbarui');
      cancelEdit();
    } catch (err) {
      showToast('error', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (order: CateringOrder, newStatus: string) => {
    if (order.status === newStatus) return;
    try {
      await updateStatus(order.id, newStatus);
      showToast('success', `Status diubah ke ${STATUS_LABELS[newStatus] ?? newStatus}`);
    } catch (err) {
      showToast('error', getErrorMessage(err));
    }
  };

  const handleDelete = async (order: CateringOrder) => {
    if (!confirm(`Hapus pesanan catering dari ${order.client_name}?`)) return;
    try {
      await deleteOrder(order.id);
      showToast('success', 'Pesanan catering berhasil dihapus');
    } catch (err) {
      showToast('error', getErrorMessage(err));
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const idx = CATERING_STATUSES.indexOf(currentStatus as typeof CATERING_STATUSES[number]);
    if (idx >= 0 && idx < CATERING_STATUSES.length - 1) {
      return CATERING_STATUSES[idx + 1];
    }
    return null;
  };

  const SortHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
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

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-800 bg-gray-900 p-12">
        <Spinner />
        <span className="ml-3 text-gray-400">Memuat pesanan catering...</span>
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

  if (orders.length === 0 && !debouncedSearch) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
        <div className="text-4xl" aria-hidden="true">
          🍽️
        </div>
        <p className="mt-2 text-sm text-gray-400">Belum ada pesanan catering</p>
        <p className="mt-1 text-xs text-gray-600">
          Tambahkan pesanan catering melalui halaman Data Management
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama klien..."
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 min-h-[40px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white min-h-[40px]"
        >
          <option value="">Semua Status</option>
          {CATERING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {editingId && (
        <form
          onSubmit={handleUpdate}
          className="rounded-xl border border-amber-700 bg-amber-950/20 p-4 space-y-4"
        >
          <h4 className="text-sm font-semibold text-amber-400">Edit Pesanan Catering</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Nama Klien</label>
              <input
                type="text"
                value={editForm.client_name}
                maxLength={200}
                onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-white min-h-[40px]"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Tanggal</label>
              <input
                type="date"
                value={editForm.order_date}
                onChange={(e) => setEditForm({ ...editForm, order_date: e.target.value })}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-white [color-scheme:dark] min-h-[40px]"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Nominal (Rp)</label>
              <input
                type="number"
                value={editForm.total_amount}
                min="1"
                step="1"
                onChange={(e) => setEditForm({ ...editForm, total_amount: e.target.value })}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-white min-h-[40px]"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Catatan</label>
              <input
                type="text"
                value={editForm.notes}
                maxLength={1000}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full rounded border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-white min-h-[40px]"
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

      {filteredAndSorted.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-sm text-gray-400">
            Tidak ada hasil untuk "{debouncedSearch}"
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3">
                  <SortHeader field="client_name">Klien</SortHeader>
                </th>
                <th className="px-4 py-3">
                  <SortHeader field="order_date">Tanggal</SortHeader>
                </th>
                <th className="px-4 py-3">
                  <SortHeader field="total_amount">Nominal</SortHeader>
                </th>
                <th className="px-4 py-3">
                  <SortHeader field="status">Status</SortHeader>
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">Catatan</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((order) => {
                const nextStatus = getNextStatus(order.status);
                return (
                  <tr
                    key={order.id}
                    className="border-b border-gray-800/50 transition-colors hover:bg-gray-800/30"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {order.client_name}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {formatDate(order.order_date)}
                    </td>
                    <td className="px-4 py-3 font-medium text-amber-400">
                      {formatRupiah(order.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <CateringStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                      {order.notes || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {nextStatus && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order, nextStatus)}
                            className="rounded bg-blue-800/50 px-2.5 py-1 text-xs text-blue-400 transition-colors hover:bg-blue-800 hover:text-white"
                            title={`Ubah ke ${STATUS_LABELS[nextStatus]}`}
                          >
                            → {STATUS_LABELS[nextStatus]}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => startEdit(order)}
                          className="rounded bg-gray-700 px-2.5 py-1 text-xs text-white transition-colors hover:bg-gray-600"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(order)}
                          className="rounded bg-red-800/50 px-2.5 py-1 text-xs text-red-400 transition-colors hover:bg-red-800 hover:text-white"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-800">
                <td className="px-4 py-3 text-xs text-gray-500">
                  Total: {filteredAndSorted.length} pesanan
                </td>
                <td colSpan={1}></td>
                <td className="px-4 py-3 font-semibold text-amber-400">
                  {formatRupiah(
                    filteredAndSorted.reduce((sum, o) => sum + o.total_amount, 0)
                  )}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
