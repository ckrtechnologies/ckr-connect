import { z } from 'zod';

export const updateAttendanceSchema = z.object({
  status: z.enum(['present', 'half_day', 'absent', 'on_leave', 'holiday']),
  punch_in: z.string().nullable().optional(),
  punch_out: z.string().nullable().optional(),
  check_in_time: z.string().nullable().optional(),
  check_out_time: z.string().nullable().optional(),
  correction_reason: z.string().min(5, 'A clear correction reason of at least 5 characters is mandatory for audit trail'),
  bdm_id: z.string().optional(),
  date: z.string().optional(),
});
