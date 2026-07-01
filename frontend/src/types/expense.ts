export interface MonthlyExpense {
  id: string;
  outlet_id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
}

export interface ExpenseListResponse {
  success: boolean;
  data: MonthlyExpense[];
  meta?: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ExpenseCreateResponse {
  success: boolean;
  data: MonthlyExpense;
}

export interface ExpenseUpdateResponse {
  success: boolean;
  data: MonthlyExpense;
}

export interface ExpenseDeleteResponse {
  success: boolean;
  data: { message: string };
}

export interface ExpenseCategoriesResponse {
  success: boolean;
  data: string[];
}

export interface ProfitLossData {
  totalRevenue: number;
  totalExpenses: number;
  profitLoss: number;
  isLoss: boolean;
  isBreakEven: boolean;
}

export const EXPENSE_CATEGORIES = ['BAHAN_BAKU', 'GAJI', 'OPERASIONAL', 'LAINNYA'] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  BAHAN_BAKU: 'Bahan Baku',
  GAJI: 'Gaji',
  OPERASIONAL: 'Operasional',
  LAINNYA: 'Lainnya',
};
