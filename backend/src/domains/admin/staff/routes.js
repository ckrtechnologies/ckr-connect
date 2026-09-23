import { Router } from 'express';
import { adminStaffController } from './controller.js';
import { validate } from '../../../middlewares/validate.js';
import { createStaffSchema, updateStaffSchema, resetPasswordSchema } from './validation.js';

const router = Router();

router.get('/', adminStaffController.listStaff);
router.post('/', validate(createStaffSchema), adminStaffController.inviteStaff);
router.get('/:id', adminStaffController.getStaffById);
router.put('/:id', validate(updateStaffSchema), adminStaffController.updateStaff);
router.post('/:id/reset-password', validate(resetPasswordSchema), adminStaffController.resetPassword);
router.patch('/:id/toggle-active', adminStaffController.toggleActive);
router.delete('/:id', adminStaffController.deleteStaff);

export default router;
