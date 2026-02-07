import { Router } from 'express';
import { history, summary, trends, editPayment, deletePayment, createOneTimePayment } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPaymentSchema, updatePaymentSchema } from '../validation/schemas.js';

const router = Router();

router.get('/summary', requireAuth, summary);
router.get('/trends', requireAuth, trends);
router.post('/one-time', requireAuth, validate(createPaymentSchema), createOneTimePayment);
router.get('/:name?', requireAuth, history);
router.put('/:id', requireAuth, validate(updatePaymentSchema), editPayment);
router.delete('/:id', requireAuth, deletePayment);

export default router;
