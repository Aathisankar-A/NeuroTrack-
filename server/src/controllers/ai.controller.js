import AIService from '../services/ai.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

class AIController {
    /**
     * Get personalized performance insights using Gemini.
     */
    static getInsights = asyncHandler(async (req, res) => {
        const insights = await AIService.generateUserInsights(req.user.id);
        res.json(ApiResponse.success(insights, 'AI Insights generated successfully'));
    });
    /**
     * POST endpoint executing the new rigid AI analysis format
     */
    static analyze = asyncHandler(async (req, res) => {
        const analysis = await AIService.generateAnalysis(req.user.id);
        res.json(ApiResponse.success(analysis, 'AI Analysis generated successfully'));
    });

    /**
     * POST endpoint for generating context-aware questions
     */
    static generateQuestions = asyncHandler(async (req, res) => {
        const { topic, useResources, resourceIds } = req.body;
        
        if (!topic) {
            return res.status(400).json(ApiResponse.error('Topic is required', 400));
        }

        const questions = await AIService.generateQuestions(req.user.id, topic, useResources, resourceIds);
        res.json(ApiResponse.success(questions, 'Questions generated successfully'));
    });

    /**
     * POST endpoint for generating an AI study plan
     */
    static generatePlan = asyncHandler(async (req, res) => {
        const { goal, durationMinutes } = req.body;
        
        if (!goal || !durationMinutes) {
            return res.status(400).json(ApiResponse.error('Goal and duration are required', 400));
        }

        const plan = await AIService.generatePlan(req.user.id, goal, durationMinutes);
        res.json(ApiResponse.success(plan, 'Study plan generated successfully'));
    });
}

export default AIController;
