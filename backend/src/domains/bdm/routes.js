import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';

import bdmWorkspaceRoutes from './workspace/routes.js';
import bdmLeadsRoutes from './leads/routes.js';
import bdmInteractionsRoutes from './interactions/routes.js';
import bdmAttendanceRoutes from './attendance/routes.js';
import bdmNotificationsRoutes from './notifications/routes.js';

const router = Router();

// Protect ALL bdm routes with JWT Auth + BDM/Admin role check
router.use(authenticate, requireRole(['bdm', 'admin']));

router.use('/workspace', bdmWorkspaceRoutes);
router.use('/leads', bdmLeadsRoutes);
router.use('/interactions', bdmInteractionsRoutes);
router.use('/attendance', bdmAttendanceRoutes);
router.use('/notifications', bdmNotificationsRoutes);

export default router;
