import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(2, 'Tag name is required'),
  type: z.enum(['product', 'service']).default('product')
});

export const updateTagSchema = z.object({
  name: z.string().min(2).optional(),
  type: z.enum(['product', 'service']).optional(),
  is_active: z.boolean().optional()
});

export const createHolidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  name: z.string().min(2, 'Holiday name is required')
});

export const updateHolidaySchema = createHolidaySchema.partial();
