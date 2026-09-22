import { Router } from 'express';
import { bdmNotificationsController } from './controller.js';

const router = Router();

router.get('/', bdmNotificationsController.getFeed);
router.patch('/:id/read', bdmNotificationsController.markAsRead);
router.post('/mark-all-read', bdmNotificationsController.markAllAsRead);

export default router;
