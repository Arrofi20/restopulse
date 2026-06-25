import { z } from 'zod';

export const createSalesSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  revenue: z.number().positive('Revenue must be a positive number'),
  top_menu_items: z
    .array(z.string().min(1, 'Menu item cannot be empty'))
    .min(1, 'At least one menu item is required')
    .max(10, 'Maximum 10 menu items'),
});

export const dateRangeSchema = z
  .object({
    start: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    end: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  })
  .refine((data) => data.start <= data.end, {
    message: 'Start date must be before or equal to end date',
    path: ['start'],
  });
