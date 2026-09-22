import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  company_code: z.string().min(2).optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  primary_contact_name: z.string().optional(),
  primary_contact_email: z.string().email().optional().or(z.literal('')),
  primary_contact_phone: z.string().optional(),
  address: z.string().optional()
});

export const updateAccountSchema = createAccountSchema.partial();
