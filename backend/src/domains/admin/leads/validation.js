import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Contact/Lead name is required'),
  phone: z.string().min(5, 'Phone number is required'),
  notes: z.string().optional().or(z.literal('')),
  discussion_notes: z.string().optional().or(z.literal('')),
  company_name: z.string().nullable().optional().or(z.literal('')),
  email: z.string().nullable().optional().or(z.literal('')),
  city: z.string().nullable().optional().or(z.literal('')),
  state: z.string().nullable().optional().or(z.literal('')),
  source: z.string().optional().default('website'),
  tag_id: z.string().nullable().optional().or(z.literal('')),
  sub_requirement: z.string().nullable().optional().or(z.literal('')),
  deal_type: z.string().optional().default('new_business'),
  assigned_to: z.string().nullable().optional().or(z.literal('')),
  status: z.string().optional().default('new'),
  priority: z.string().optional().default('medium'),
  budget: z.coerce.number().optional().default(0),
  expected_value: z.coerce.number().optional().default(0),
  won_amount: z.coerce.number().optional().default(0),
  next_followup_date: z.string().nullable().optional().or(z.literal(''))
});

export const updateLeadSchema = createLeadSchema.partial();

export const updateStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'follow_up', 'proposal', 'won', 'lost', 'invalid']),
  lost_reason: z.string().optional(),
  invalid_reason: z.enum(['wrong_number', 'duplicate', 'not_interested', 'spam', 'out_of_service_area', 'other']).optional(),
  won_amount: z.coerce.number().nonnegative().optional()
});

export const bulkAssignSchema = z.object({
  lead_ids: z.array(z.string().uuid()).min(1, 'At least one lead ID is required'),
  assigned_to: z.string().uuid('Assigned BDM ID is required').optional(),
  bdm_id: z.string().uuid('Assigned BDM ID is required').optional()
}).refine((data) => data.assigned_to || data.bdm_id, {
  message: 'Assigned BDM ID is required',
  path: ['assigned_to']
});
