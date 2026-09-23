import { Router } from 'express';
import { adminInteractionsController } from './controller.js';

const router = Router();

router.get('/', adminInteractionsController.listInteractions);
router.post('/', adminInteractionsController.logInteraction);
router.get('/daily-summary', adminInteractionsController.getDailySummary);
router.get('/export-csv', adminInteractionsController.exportCsv);

export default router;
