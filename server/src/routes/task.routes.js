import express from 'express';
import TaskController from '../controllers/task.controller.js';
import validate from '../middleware/validate.middleware.js';
import { createTaskSchema, updateTaskSchema } from '../validators/task.schema.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All task routes are protected

router.post('/', validate(createTaskSchema), TaskController.create);
router.get('/', TaskController.getAll);
router.put('/:id', validate(updateTaskSchema), TaskController.update);
router.delete('/:id', TaskController.delete);
router.patch('/:id/toggle', TaskController.toggleComplete);

export default router;
