import { Router } from 'express';
import * as controller from '../controllers/billController.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/upcoming', controller.upcoming);
router.get('/summary', controller.summary);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
