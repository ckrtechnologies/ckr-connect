import { z } from 'zod';

export const createBdmLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  company_name: z.string().optional().nullable().or(z.literal('')),
  email: z.string().trim().email('Please enter a valid email address').optional().nullable().or(z.literal('')),
  city: z.string().optional().nullable().or(z.literal('')),
  state: z.string().optional().nullable().or(z.literal('')),
  source: z.string().optional().default('bdm_inbound'),
  notes: z.string().optional().nullable().or(z.literal('')),
  discussion_notes: z.string().optional().nullable().or(z.literal('')),
  sub_requirement: z.string().optional().nullable().or(z.literal('')),
  expected_value: z.coerce.number().optional().default(0),
  budget: z.coerce.number().optional().default(0),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  status: z.enum(['new', 'contacted', 'follow_up', 'proposal', 'won', 'lost', 'invalid']).optional().default('new'),
  next_followup_date: z.string().optional().nullable().or(z.literal('')),
  tag_id: z.string().optional().nullable().or(z.literal('')),
  tag_ids: z.array(z.string()).optional()
});

export const updateBdmStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'follow_up', 'proposal', 'won', 'lost', 'invalid']),
  next_followup_date: z.string().optional().nullable().or(z.literal('')),
  remarks: z.string().optional().nullable().or(z.literal('')),
  lost_reason: z.string().optional().nullable().or(z.literal('')),
  invalid_reason: z.enum(['wrong_number', 'duplicate', 'not_interested', 'spam', 'out_of_service_area', 'other']).optional().nullable(),
  won_amount: z.coerce.number().nonnegative().optional()
});

