import { Router } from 'express';
import { bdmAttendanceController } from './controller.js';

const router = Router();

router.get('/today', bdmAttendanceController.getTodayStatus);
router.post('/punch-in', bdmAttendanceController.punchIn);
router.post('/punch-out', bdmAttendanceController.punchOut);
router.get('/my-history', bdmAttendanceController.getMyHistory);

export default router;
