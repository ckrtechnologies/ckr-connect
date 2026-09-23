import { z } from 'zod';

export const updateBdmStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'follow_up', 'proposal', 'won', 'lost', 'invalid']),
  lost_reason: z.string().optional(),
  invalid_reason: z.enum(['wrong_number', 'duplicate', 'not_interested', 'spam', 'out_of_service_area', 'other']).optional(),
  won_amount: z.coerce.number().nonnegative().optional()
});
