import { Router } from 'express';
import { history, summary, trends, editPayment, deletePayment, createOneTimePayment } from '../controllers/paymentController.js';

const router = Router();

router.get('/summary', summary);
router.get('/trends', trends);
router.post('/one-time', createOneTimePayment);
router.get('/:name?', history);
router.put('/:id', editPayment);
router.delete('/:id', deletePayment);

export default router;
