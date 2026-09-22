import { Router } from 'express';
import { bdmInteractionsController } from './controller.js';
import { validate } from '../../../middlewares/validate.js';
import { createInteractionSchema } from './validation.js';

const router = Router();

router.post('/', validate(createInteractionSchema), bdmInteractionsController.logInteraction);
router.get('/history', bdmInteractionsController.listHistory);

export default router;
