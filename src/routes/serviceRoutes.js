import { Router } from 'express';
import * as controller from '../controllers/serviceController.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.post('/', controller.create);
router.patch('/:id/archive', controller.archive);

export default router;
