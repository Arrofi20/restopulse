export interface CateringOrder {
  id: string;
  outlet_id: string;
  client_name: string;
  order_date: string;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface CateringListResponse {
  success: boolean;
  data: CateringOrder[];
}

export interface CateringCreateResponse {
  success: boolean;
  data: CateringOrder;
}

export interface CateringUpdateResponse {
  success: boolean;
  data: CateringOrder;
}

export interface CateringDeleteResponse {
  success: boolean;
  data: { message: string };
}

export interface CateringStatusesResponse {
  success: boolean;
  data: string[];
}

export const CATERING_STATUSES = ['PENDING', 'CONFIRMED', 'DONE'] as const;

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  DONE: 'Done',
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  CONFIRMED: 'bg-blue-900/50 text-blue-400 border-blue-800',
  DONE: 'bg-green-900/50 text-green-400 border-green-800',
};

export const STATUS_DOT_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-500',
  DONE: 'bg-green-500',
};
