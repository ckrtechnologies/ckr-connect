import { Router } from 'express';
import { bdmWorkspaceController } from './controller.js';

const router = Router();

router.get('/dashboard', bdmWorkspaceController.getDashboard);

export default router;
