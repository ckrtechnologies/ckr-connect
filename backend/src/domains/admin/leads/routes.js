import { Router } from 'express';
import { adminLeadsController } from './controller.js';
import { validate } from '../../../middlewares/validate.js';
import { uploadCsv } from '../../../middlewares/upload.js';
import {
  createLeadSchema,
  updateLeadSchema,
  updateStatusSchema,
  bulkAssignSchema
} from './validation.js';

const router = Router();

router.get('/', adminLeadsController.listLeads);
router.post('/', validate(createLeadSchema), adminLeadsController.createLead);
router.get('/export-csv', adminLeadsController.exportCsv);
router.post('/import-csv', uploadCsv.single('file'), adminLeadsController.importCsv);
router.post('/bulk-assign', validate(bulkAssignSchema), adminLeadsController.bulkAssign);

router.get('/:id', adminLeadsController.getLeadById);
router.put('/:id', validate(updateLeadSchema), adminLeadsController.updateLead);
router.patch('/:id/status', validate(updateStatusSchema), adminLeadsController.updateStatus);

export default router;
