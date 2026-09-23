import { z } from 'zod';

export const createStaffSchema = z.object({
  employee_id: z.string().min(3).optional(),
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(7, 'Phone number must be at least 7 digits').optional(),
  role: z.enum(['admin', 'bdm', 'telecaller', 'manager']).default('bdm'),
  designation: z.string().optional(),
  target_amount: z.number().nonnegative().optional().default(0),
  temp_password: z.string().min(6).optional().default('password@1')
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).optional(),
  role: z.enum(['admin', 'bdm', 'telecaller', 'manager']).optional(),
  designation: z.string().optional(),
  target_amount: z.number().nonnegative().optional(),
  is_active: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional()
});

export const resetPasswordSchema = z.object({
  temp_password: z.string().min(6).optional().default('password@1')
});
