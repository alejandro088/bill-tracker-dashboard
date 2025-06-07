import { Router } from 'express';
import { history } from '../controllers/paymentController.js';

const router = Router();

router.get('/:name?', history);

export default router;
