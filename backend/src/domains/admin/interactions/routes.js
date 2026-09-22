import { Router } from 'express';
import { adminInteractionsController } from './controller.js';

const router = Router();

router.get('/', adminInteractionsController.listInteractions);
router.get('/daily-summary', adminInteractionsController.getDailySummary);

export default router;
