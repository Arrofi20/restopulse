import { useState, useCallback, useEffect } from 'react';
import { get, post, put, del } from '../api/client';
import type {
  MonthlyExpense,
  ExpenseListResponse,
  ExpenseCreateResponse,
  ExpenseUpdateResponse,
  ExpenseDeleteResponse,
} from '../types/expense';

interface UseExpensesResult {
  expenses: MonthlyExpense[];
  loading: boolean;
  error: string | null;
  total: number;
  refresh: () => void;
  createExpense: (data: {
    category: string;
    amount: number;
    month: number;
    year: number;
  }) => Promise<boolean>;
  updateExpense: (
    id: string,
    data: Partial<{
      category: string;
      amount: number;
      month: number;
      year: number;
    }>
  ) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
}

export function useExpenses(): UseExpensesResult {
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchExpenses() {
      setLoading(true);
      setError(null);
      try {
        const result = await get<ExpenseListResponse>(
          '/expenses?limit=200&orderBy=created_at&order=desc'
        );
        if (!cancelled) {
          setExpenses(result.data ?? []);
          setTotal(result.meta?.total ?? result.data?.length ?? 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Gagal memuat data pengeluaran'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchExpenses();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const createExpense = useCallback(
    async (data: {
      category: string;
      amount: number;
      month: number;
      year: number;
    }): Promise<boolean> => {
      try {
        await post<ExpenseCreateResponse>('/expenses', data);
        refresh();
        return true;
      } catch (err) {
        throw err;
      }
    },
    [refresh]
  );

  const updateExpense = useCallback(
    async (
      id: string,
      data: Partial<{
        category: string;
        amount: number;
        month: number;
        year: number;
      }>
    ): Promise<boolean> => {
      try {
        await put<ExpenseUpdateResponse>(`/expenses/${id}`, data);
        refresh();
        return true;
      } catch (err) {
        throw err;
      }
    },
    [refresh]
  );

  const deleteExpense = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await del<ExpenseDeleteResponse>(`/expenses/${id}`);
        refresh();
        return true;
      } catch (err) {
        throw err;
      }
    },
    [refresh]
  );

  return {
    expenses,
    loading,
    error,
    total,
    refresh,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
