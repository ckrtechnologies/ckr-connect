import { Router } from 'express';
import { bdmLeadsController } from './controller.js';
import { validate } from '../../../middlewares/validate.js';
import { uploadBrd } from '../../../middlewares/upload.js';
import { createBdmLeadSchema, updateBdmStatusSchema } from './validation.js';

const router = Router();

router.get('/', bdmLeadsController.listMyLeads);
router.post('/', validate(createBdmLeadSchema), bdmLeadsController.createLead);
router.get('/:id', bdmLeadsController.getMyLeadById);
router.post('/:id/upload-brd', uploadBrd.single('brd'), bdmLeadsController.uploadBrd);
router.patch('/:id/status', validate(updateBdmStatusSchema), bdmLeadsController.updateStatus);

export default router;

