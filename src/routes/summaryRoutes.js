import { Router } from 'express';
import { monthly } from '../controllers/summaryController.js';

const router = Router();

router.get('/monthly', monthly);

export default router;
