import { Router } from 'express';
import { adminDashboardController } from './controller.js';

const router = Router();

router.get('/', adminDashboardController.getSummary);
router.get('/summary', adminDashboardController.getSummary);

export default router;
