import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Contact/Lead name is required'),
  company_name: z.string().optional(),
  phone: z.string().min(7, 'Phone number must be at least 7 digits'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  city: z.string().optional(),
  state: z.string().optional(),
  source: z.enum(['website', 'referral', 'cold_call', 'social_media', 'walk_in', 'meta_lead_ads', 'whatsapp_ads', 'other']).default('website'),
  tag_id: z.string().uuid().nullable().optional(),
  sub_requirement: z.string().optional(),
  deal_type: z.enum(['new_business', 'upsell', 'resell']).default('new_business'),
  assigned_to: z.string().uuid().nullable().optional(),
  status: z.enum(['new', 'contacted', 'follow_up', 'proposal', 'won', 'lost', 'invalid']).default('new'),
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  budget: z.number().nonnegative().optional().default(0),
  expected_value: z.number().nonnegative().optional().default(0),
  won_amount: z.number().nonnegative().optional().default(0),
  next_followup_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const updateLeadSchema = createLeadSchema.partial();

export const updateStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'follow_up', 'proposal', 'won', 'lost', 'invalid']),
  lost_reason: z.string().optional(),
  invalid_reason: z.enum(['wrong_number', 'duplicate', 'not_interested', 'spam', 'out_of_service_area', 'other']).optional(),
  won_amount: z.number().nonnegative().optional()
});

export const bulkAssignSchema = z.object({
  lead_ids: z.array(z.string().uuid()).min(1, 'At least one lead ID is required'),
  assigned_to: z.string().uuid('Assigned BDM ID is required')
});
