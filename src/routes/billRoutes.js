import { Router } from 'express';
import * as controller from '../controllers/billController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createBillSchema, updateBillSchema, billQuerySchema } from '../validation/schemas.js';

const router = Router();

router.get('/', requireAuth, validate(billQuerySchema, 'query'), controller.getAll);
router.get('/upcoming', requireAuth, controller.getUpcoming);
router.get('/summary', requireAuth, controller.getSummaryStats);
router.get('/:id', requireAuth, controller.getById);
router.post('/', requireAuth, validate(createBillSchema), controller.create);
router.put('/:id', requireAuth, validate(updateBillSchema), controller.update);
router.delete('/:id', requireAuth, controller.remove);

export default router;
