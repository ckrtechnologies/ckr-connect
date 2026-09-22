import { Router } from 'express';
import { adminAttendanceController } from './controller.js';
import { validate } from '../../../middlewares/validate.js';
import { updateAttendanceSchema } from './validation.js';

const router = Router();

router.get('/matrix', adminAttendanceController.getMatrix);
router.put('/:id', validate(updateAttendanceSchema), adminAttendanceController.updateAttendance);
router.post('/upsert', validate(updateAttendanceSchema), adminAttendanceController.upsertAttendance);

export default router;
