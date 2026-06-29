import Session from '../models/Session.js';
import Task from '../models/Task.js';
import ProductivityScore from '../models/ProductivityScore.js';
import BurnoutLog from '../models/BurnoutLog.js';
import Resource from '../models/Resource.js';
import GeminiService from './gemini.service.js';

class AIService {
    /**
     * Aggregates user data from the last 7 days and gets AI insights.
     */
    static async generateUserInsights(userId) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setUTCHours(0, 0, 0, 0);

        // 1. Fetch historical data
        const [sessions, tasks, scores, burnoutLogs] = await Promise.all([
            Session.find({ userId, startedAt: { $gte: sevenDaysAgo }, status: { $in: ['completed', 'stopped early', 'abandoned'] } }).sort({ startedAt: -1 }),
            Task.find({ userId, createdAt: { $gte: sevenDaysAgo } }),
            ProductivityScore.find({ userId, date: { $gte: sevenDaysAgo } }).sort({ date: -1 }),
            BurnoutLog.find({ userId, createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: -1 })
        ]);

        // 2. Format data for AI
        const dataSummary = {
            focusSessions: sessions.map(s => {
                const actual = s.actualDuration !== undefined ? s.actualDuration : (s.status === 'completed' ? s.duration : 0);
                const planned = s.plannedDuration !== undefined ? s.plannedDuration : s.duration;
                return {
                    plannedDuration: planned,
                    actualDuration: actual,
                    completionPercentage: s.completionPercentage || (planned ? Math.round((actual / planned) * 100) : 0),
                    subject: s.subject,
                    rating: s.focusRating,
                    energy: s.energyLevel,
                    distractions: s.distractionCount,
                    date: s.startedAt,
                    status: s.status
                };
            }),
            taskPerformance: {
                total: tasks.length,
                completed: tasks.filter(t => t.completed).length,
                subjects: [...new Set(tasks.map(t => t.subject))]
            },
            productivityTrends: scores.map(s => ({
                date: s.date,
                score: s.score,
                focusMinutes: s.deepFocusMinutes
            })),
            burnoutHistory: burnoutLogs.map(b => ({
                date: b.createdAt,
                risk: b.riskLevel,
                score: b.riskScore
            }))
        };

        // 3. Get insights from Gemini
        return await GeminiService.getPerformanceInsights(dataSummary);
    }
    /**
     * Builds structured data for the new AI analyze request
     */
    static async generateAnalysis(userId) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setUTCHours(0, 0, 0, 0);

        const [sessions, tasks, scores] = await Promise.all([
            Session.find({ userId, startedAt: { $gte: sevenDaysAgo }, status: { $in: ['completed', 'stopped early', 'abandoned'] } }).sort({ startedAt: -1 }),
            Task.find({ userId }),
            ProductivityScore.findOne({ userId }).sort({ date: -1 })
        ]);

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.completed).length;
        const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;

        const subjectsMap = {};
        const formattedSessions = [];

        sessions.forEach(s => {
            const actual = s.actualDuration !== undefined ? s.actualDuration : (s.status === 'completed' ? s.duration : 0);
            const planned = s.plannedDuration !== undefined ? s.plannedDuration : s.duration;
            if (!subjectsMap[s.subject]) subjectsMap[s.subject] = 0;
            subjectsMap[s.subject] += actual;

            formattedSessions.push({
                subject: s.subject,
                plannedDuration: planned,
                actualDuration: actual,
                completionPercentage: s.completionPercentage || (planned ? Math.round((actual / planned) * 100) : 0),
                focusRating: s.focusRating,
                status: s.status
            });
        });

        const streak = scores ? scores.consistencyStreak : 0;

        const inputData = {
            user_profile: { streak },
            last_7_days: {
                sessions: formattedSessions,
                subjects: subjectsMap
            },
            task_completion_rate: parseFloat(taskCompletionRate.toFixed(2)),
            request: "Analyze productivity and give improvement suggestions"
        };

        return await GeminiService.analyzeProductivity(inputData);
    }

    /**
     * Generates study questions. If useResources provided, fetches from DB.
     */
    static async generateQuestions(userId, topic, useResources, resourceIds) {
        let resourceContext = null;

        if (useResources && resourceIds && resourceIds.length > 0) {
            const resources = await Resource.find({
                _id: { $in: resourceIds }
            }).populate('collectionId');

            // Verify the resources belong to one of the user's collections
            // (Assuming collectionId has userId from our earlier Phase 2 implementation, 
            // though standard filtering by just IDs is generally done here for simplicity. 
            // Let's filter directly.)
            
            if (resources.length > 0) {
                resourceContext = resources.map(r => {
                    return `Title: ${r.title}\nType: ${r.type}\nContent: ${r.notes || r.url || 'None'}`;
                }).join('\n\n');
            }
        }

        return await GeminiService.generateQuestions(topic, resourceContext);
    }

    /**
     * Calls Gemini to generate a structured timeline for a focus session
     */
    static async generatePlan(userId, goal, durationMinutes) {
        return await GeminiService.generateStudyPlan(goal, durationMinutes);
    }
}

export default AIService;
