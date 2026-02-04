import express from 'express';
import * as paymentMethodController from '../controllers/paymentMethodController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, paymentMethodController.getAllPaymentMethods);
router.post('/', requireAuth, paymentMethodController.createPaymentMethod);
router.put('/:id', requireAuth, paymentMethodController.updatePaymentMethod);
router.delete('/:id', requireAuth, paymentMethodController.deletePaymentMethod);

export default router;
