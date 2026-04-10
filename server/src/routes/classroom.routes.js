import express from 'express';
import ClassroomController from '../controllers/classroom.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/', authorize('teacher', 'admin'), ClassroomController.createClassroom);
router.get('/', ClassroomController.getMyClassrooms);
router.post('/join', ClassroomController.joinClassroom);
router.get('/:id', ClassroomController.getClassroomDetails);
router.delete('/:id/students/:studentId', authorize('teacher', 'admin'), ClassroomController.removeStudent);

export default router;
