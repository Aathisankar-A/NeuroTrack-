import AnalyticsService from '../services/analytics.service.js';
import AchievementService from '../services/achievement.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

class AnalyticsController {
    static getOverview = asyncHandler(async (req, res) => {
        const overview = await AnalyticsService.getOverview(req.user.id);
        res.json(ApiResponse.success(overview, 'Analytics overview fetched'));
    });

    static getDaily = asyncHandler(async (req, res) => {
        const stats = await AnalyticsService.getDailyStats(req.user.id, new Date());
        res.json(ApiResponse.success(stats, 'Daily stats fetched'));
    });

    static getWeekly = asyncHandler(async (req, res) => {
        const trend = await AnalyticsService.getWeeklyTrend(req.user.id);
        res.json(ApiResponse.success(trend, 'Weekly trend fetched'));
    });

    static getBurnout = asyncHandler(async (req, res) => {
        const risk = await AnalyticsService.getLatestBurnoutRisk(req.user.id);
        res.json(ApiResponse.success(risk, 'Burnout risk fetched'));
    });

    static getSubjects = asyncHandler(async (req, res) => {
        const efficiency = await AnalyticsService.getSubjectEfficiency(req.user.id);
        res.json(ApiResponse.success(efficiency, 'Subject efficiency fetched'));
    });

    static getAchievements = asyncHandler(async (req, res) => {
        const achievements = await AchievementService.getUserAchievements(req.user.id);
        res.json(ApiResponse.success(achievements, 'Achievements fetched'));
    });

    static getHistory = asyncHandler(async (req, res) => {
        const history = await AnalyticsService.getRecentActivities(req.user.id);
        res.json(ApiResponse.success(history, 'Activity history fetched'));
    });
}

export default AnalyticsController;
