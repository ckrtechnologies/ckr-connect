import { z } from 'zod';

export const createBdmLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  company_name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  source: z.string().optional().default('bdm_inbound'),
  notes: z.string().optional().nullable(),
  expected_value: z.coerce.number().optional().default(0),
  budget: z.coerce.number().optional().default(0),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  next_followup_date: z.string().optional().nullable(),
  tag_id: z.string().uuid().optional().nullable()
});

export const updateBdmStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'follow_up', 'proposal', 'won', 'lost', 'invalid']),
  lost_reason: z.string().optional(),
  invalid_reason: z.enum(['wrong_number', 'duplicate', 'not_interested', 'spam', 'out_of_service_area', 'other']).optional(),
  won_amount: z.coerce.number().nonnegative().optional()
});

