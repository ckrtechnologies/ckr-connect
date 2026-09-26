import { Router } from 'express';
import { bdmWorkspaceController } from './controller.js';

const router = Router();

router.get('/', bdmWorkspaceController.getDashboard);
router.get('/dashboard', bdmWorkspaceController.getDashboard);

export default router;
