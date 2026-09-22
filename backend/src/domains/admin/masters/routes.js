import { Router } from 'express';
import { adminMastersController } from './controller.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createTagSchema,
  updateTagSchema,
  createHolidaySchema,
  updateHolidaySchema
} from './validation.js';

const router = Router();

// Tags
router.get('/tags', adminMastersController.listTags);
router.post('/tags', validate(createTagSchema), adminMastersController.createTag);
router.put('/tags/:id', validate(updateTagSchema), adminMastersController.updateTag);
router.delete('/tags/:id', adminMastersController.deleteTag);

// Holidays
router.get('/holidays', adminMastersController.listHolidays);
router.post('/holidays', validate(createHolidaySchema), adminMastersController.createHoliday);
router.put('/holidays/:id', validate(updateHolidaySchema), adminMastersController.updateHoliday);
router.delete('/holidays/:id', adminMastersController.deleteHoliday);

export default router;
