import { Router } from 'express';
import { adminAttendanceController } from './controller.js';
import { validate } from '../../../middlewares/validate.js';
import { updateAttendanceSchema } from './validation.js';

const router = Router();

router.get('/matrix', adminAttendanceController.getMatrix);
router.post('/correct', adminAttendanceController.upsertAttendance);
router.post('/upsert', validate(updateAttendanceSchema), adminAttendanceController.upsertAttendance);
router.put('/:id', validate(updateAttendanceSchema), adminAttendanceController.updateAttendance);

export default router;
