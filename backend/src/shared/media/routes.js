import { Router } from 'express';
import { mediaController } from './controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

router.get('/brd/:leadId', authenticate, mediaController.downloadBrd);

export default router;
