import { z } from 'zod';

export const createInteractionSchema = z.object({
  lead_id: z.string().uuid('Valid Lead ID is required'),
  type: z.enum(['call', 'meeting', 'whatsapp', 'email', 'note', 'site_visit']).optional().default('call'),
  channel: z.string().optional(),
  call_result: z.string().optional(),
  outcome: z.string().optional(),
  call_result_label: z.string().optional(),
  call_result_type: z.string().optional(),
  notes: z.string().optional(),
  discussion_notes: z.string().optional(),
  next_action: z.string().optional(),
  next_followup_date: z.string().nullable().optional().or(z.literal('')),
  next_action_date: z.string().nullable().optional().or(z.literal('')),
  followup_time: z.string().nullable().optional().or(z.literal(''))
}).refine(data => data.notes || data.discussion_notes, {
  message: 'Interaction notes or discussion notes are required'
});
