import { Router } from 'express';
import * as controller from '../controllers/serviceController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, controller.getAll);
router.get('/:id', requireAuth, controller.getById);
router.put('/:id', requireAuth, controller.update);
router.post('/', requireAuth, controller.create);
router.patch('/:id/archive', requireAuth, controller.archive);
router.patch('/:id/restore', requireAuth, controller.restore);

export default router;
