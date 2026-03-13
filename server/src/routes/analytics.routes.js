import express from 'express';
import AnalyticsController from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', AnalyticsController.getOverview);
router.get('/daily', AnalyticsController.getDaily);
router.get('/weekly', AnalyticsController.getWeekly);
router.get('/achievements', AnalyticsController.getAchievements);
router.get('/burnout', AnalyticsController.getBurnout);
router.get('/subjects', AnalyticsController.getSubjects);
router.get('/history', AnalyticsController.getHistory);

export default router;
