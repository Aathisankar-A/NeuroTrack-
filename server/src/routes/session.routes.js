import express from 'express';
import SessionController from '../controllers/session.controller.js';
import validate from '../middleware/validate.middleware.js';
import { createSessionSchema } from '../validators/session.schema.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All session routes are protected

router.post('/', validate(createSessionSchema), SessionController.create);
router.get('/', SessionController.getAll);
router.get('/:id', SessionController.getOne);
router.delete('/:id', SessionController.delete);

// Status management
router.patch('/:id/start', SessionController.start);
router.patch('/:id/pause', SessionController.pause);
router.patch('/:id/resume', SessionController.resume);
router.patch('/:id/complete', SessionController.complete);

// Embedded Tasks
router.post('/:id/tasks', SessionController.addTask);
router.patch('/:sessionId/tasks/:taskId', SessionController.toggleTask);
router.delete('/:sessionId/tasks/:taskId', SessionController.deleteTask);
router.get('/:id/previous-unfinished-tasks', SessionController.checkUnfinished);
router.post('/:id/carry-forward', SessionController.carryForward);

export default router;
