import { Router } from 'express';
import { adminDashboardController } from './controller.js';

const router = Router();

router.get('/summary', adminDashboardController.getSummary);

export default router;
