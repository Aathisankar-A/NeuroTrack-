import express from 'express';
import AIController from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/insights', AIController.getInsights);
router.post('/analyze', AIController.analyze);
router.post('/questions', AIController.generateQuestions);
router.post('/plan', AIController.generatePlan);

export default router;
