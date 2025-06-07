import { Router } from 'express';
import { resetChat } from '../controllers/assistantController.js';

const router = Router();
router.post('/reset', resetChat);

export default router;
