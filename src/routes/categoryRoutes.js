import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validation/schemas.js';

const router = express.Router();

router.get('/', categoryController.getAllCategories);
router.post('/', validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
