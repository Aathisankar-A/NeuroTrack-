import express from 'express';
import QuizController from '../controllers/quiz.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Require authentication for all quiz routes
router.use(protect);

router.post('/generate', QuizController.generate);
router.post('/evaluate', QuizController.evaluate);

export default router;
