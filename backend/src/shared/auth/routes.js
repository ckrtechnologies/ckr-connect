import { Router } from 'express';
import { authController } from './controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/auth.js';
import { loginSchema, changePasswordSchema, refreshTokenSchema } from './validation.js';

const router = Router();

// Public routes
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);

import { uploadAvatar } from '../../middlewares/upload.js';

// Protected routes
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.patch('/onboarding-seen', authenticate, authController.markOnboardingSeen);
router.post('/upload-avatar', authenticate, uploadAvatar.single('avatar'), (req, res, next) => authController.uploadAvatar(req, res, next));

export default router;
