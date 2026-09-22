import { Router } from 'express';
import { bootstrapController } from './controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

// Both authenticated staff and newly initialized UI can access bootstrap
router.get('/', authenticate, bootstrapController.getBootstrap);

export default router;
