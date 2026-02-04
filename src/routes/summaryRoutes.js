import { Router } from 'express';
import { monthly } from '../controllers/summaryController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/monthly', requireAuth, monthly);

export default router;
