import { Router } from 'express';
import { bdmLeadsController } from './controller.js';
import { validate } from '../../../middlewares/validate.js';
import { uploadBrd } from '../../../middlewares/upload.js';
import { createBdmLeadSchema, updateBdmStatusSchema } from './validation.js';

const router = Router();

router.get('/', bdmLeadsController.listMyLeads);
router.post('/', validate(createBdmLeadSchema), bdmLeadsController.createLead);
router.get('/:id', bdmLeadsController.getMyLeadById);
router.post(
  '/:id/upload-brd',
  (req, res, next) => {
    uploadBrd.fields([{ name: 'brd', maxCount: 1 }, { name: 'file', maxCount: 1 }])(req, res, (err) => {
      if (err) return next(err);
      if (!req.file && req.files) {
        req.file = req.files['brd']?.[0] || req.files['file']?.[0];
      }
      next();
    });
  },
  bdmLeadsController.uploadBrd
);
router.post(
  '/:id/documents',
  (req, res, next) => {
    uploadBrd.fields([{ name: 'brd', maxCount: 1 }, { name: 'file', maxCount: 1 }])(req, res, (err) => {
      if (err) return next(err);
      if (!req.file && req.files) {
        req.file = req.files['brd']?.[0] || req.files['file']?.[0];
      }
      next();
    });
  },
  bdmLeadsController.uploadBrd
);
router.delete('/:id/documents/:docId', bdmLeadsController.deleteDocument);
router.patch('/:id/status', validate(updateBdmStatusSchema), bdmLeadsController.updateStatus);
router.put('/:id', bdmLeadsController.updateDetails);

export default router;

