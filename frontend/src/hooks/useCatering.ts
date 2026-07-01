import { useState, useCallback, useEffect } from 'react';
import { get, post, put, patch, del } from '../api/client';
import type {
  CateringOrder,
  CateringListResponse,
  CateringCreateResponse,
  CateringUpdateResponse,
  CateringDeleteResponse,
} from '../types/catering';

interface UseCateringResult {
  orders: CateringOrder[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  createOrder: (data: {
    client_name: string;
    order_date: string;
    total_amount: number;
    status?: string;
    notes?: string | null;
  }) => Promise<boolean>;
  updateOrder: (
    id: string,
    data: Partial<{
      client_name: string;
      order_date: string;
      total_amount: number;
      status: string;
      notes: string | null;
    }>
  ) => Promise<boolean>;
  updateStatus: (id: string, status: string) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;
}

export function useCatering(search?: string): UseCateringResult {
  const [orders, setOrders] = useState<CateringOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      setLoading(true);
      setError(null);
      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const result = await get<CateringListResponse>(`/catering${query}`);
        if (!cancelled) {
          setOrders(result.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Gagal memuat data catering'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, search]);

  const createOrder = useCallback(
    async (data: {
      client_name: string;
      order_date: string;
      total_amount: number;
      status?: string;
      notes?: string | null;
    }): Promise<boolean> => {
      await post<CateringCreateResponse>('/catering', data);
      refresh();
      return true;
    },
    [refresh]
  );

  const updateOrder = useCallback(
    async (
      id: string,
      data: Partial<{
        client_name: string;
        order_date: string;
        total_amount: number;
        status: string;
        notes: string | null;
      }>
    ): Promise<boolean> => {
      await put<CateringUpdateResponse>(`/catering/${id}`, data);
      refresh();
      return true;
    },
    [refresh]
  );

  const updateStatus = useCallback(
    async (id: string, status: string): Promise<boolean> => {
      await patch<CateringUpdateResponse>(`/catering/${id}`, { status });
      refresh();
      return true;
    },
    [refresh]
  );

  const deleteOrder = useCallback(
    async (id: string): Promise<boolean> => {
      await del<CateringDeleteResponse>(`/catering/${id}`);
      refresh();
      return true;
    },
    [refresh]
  );

  return {
    orders,
    loading,
    error,
    refresh,
    createOrder,
    updateOrder,
    updateStatus,
    deleteOrder,
  };
}
