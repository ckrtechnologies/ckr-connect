import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/rbac.js';

import adminDashboardRoutes from './dashboard/routes.js';
import adminLeadsRoutes from './leads/routes.js';
import adminStaffRoutes from './staff/routes.js';
import adminAttendanceRoutes from './attendance/routes.js';
import adminInteractionsRoutes from './interactions/routes.js';
import adminAccountsRoutes from './accounts/routes.js';
import adminMastersRoutes from './masters/routes.js';

const router = Router();

// Protect ALL admin routes with JWT Auth + Admin Role Check
router.use(authenticate, requireRole('admin'));

router.use('/dashboard', adminDashboardRoutes);
router.use('/leads', adminLeadsRoutes);
router.use('/staff', adminStaffRoutes);
router.use('/attendance', adminAttendanceRoutes);
router.use('/interactions', adminInteractionsRoutes);
router.use('/accounts', adminAccountsRoutes);
router.use('/masters', adminMastersRoutes);
// Direct aliases for /admin/tags and /admin/holidays
router.use('/', adminMastersRoutes);

export default router;
