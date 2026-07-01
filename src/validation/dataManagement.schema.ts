import { z } from 'zod';

export const EXPENSE_CATEGORIES = [
  'BAHAN_BAKU',
  'GAJI',
  'OPERASIONAL',
  'LAINNYA',
] as const;

export const createExpenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.number().positive('Amount must be a positive number'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export const updateExpenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  amount: z.number().positive('Amount must be a positive number').optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2020).max(2100).optional(),
});

export const expenseQuerySchema = z.object({
  month: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
  year: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
  offset: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
  orderBy: z
    .enum(['created_at', 'amount', 'year', 'month'])
    .optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const CATERING_STATUSES = ['PENDING', 'CONFIRMED', 'DONE'] as const;

export const createCateringSchema = z.object({
  client_name: z.string().min(1, 'Client name is required').max(200),
  order_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  total_amount: z.number().positive('Amount must be a positive number'),
  status: z.enum(CATERING_STATUSES).default('PENDING'),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateCateringStatusSchema = z.object({
  status: z.enum(CATERING_STATUSES),
});

export const updateCateringSchema = z.object({
  client_name: z.string().min(1, 'Client name is required').max(200).optional(),
  order_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  total_amount: z.number().positive('Amount must be a positive number').optional(),
  status: z.enum(CATERING_STATUSES).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export const cateringQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'From date must be in YYYY-MM-DD format')
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'To date must be in YYYY-MM-DD format')
    .optional(),
  status: z.enum(CATERING_STATUSES).optional(),
});

export const simulateSchema = z.object({
  days: z.number().int().min(1).max(365),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  confirm: z.boolean().optional().default(false),
});

export const resetDataSchema = z.object({
  confirm: z
    .boolean()
    .refine((v) => v === true, {
      message: 'Confirmation is required: set confirm to true',
    }),
});
