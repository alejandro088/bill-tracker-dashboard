import { Router } from 'express';
import { history, summary, trends, editPayment, deletePayment, createOneTimePayment } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/summary', summary);
router.get('/trends', trends);
router.post('/one-time', requireAuth, createOneTimePayment);
router.get('/:name?', history);
router.put('/:id', requireAuth, editPayment);
router.delete('/:id', requireAuth, deletePayment);

export default router;
