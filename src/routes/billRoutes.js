import { Router } from 'express';
import * as controller from '../controllers/billController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/upcoming', controller.getUpcoming);
router.get('/summary', controller.getSummaryStats);
router.get('/:id', controller.getById);
router.post('/', requireAuth, controller.create);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);

export default router;
