import { Router } from 'express';
import { adminAccountsController } from './controller.js';
import { validate } from '../../../middlewares/validate.js';
import { createAccountSchema, updateAccountSchema } from './validation.js';

const router = Router();

router.get('/', adminAccountsController.listAccounts);
router.post('/', validate(createAccountSchema), adminAccountsController.createAccount);
router.get('/:id', adminAccountsController.getAccountById);
router.put('/:id', validate(updateAccountSchema), adminAccountsController.updateAccount);

export default router;
