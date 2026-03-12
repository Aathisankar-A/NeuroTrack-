import mongoose from 'mongoose';
import ProductivityScore from '../models/ProductivityScore.js';
import BurnoutLog from '../models/BurnoutLog.js';
import Session from '../models/Session.js';
import Task from '../models/Task.js';

class AnalyticsService {
    /**
     * Get daily score and summary for a user.
     */
    static async getDailyStats(userId, date) {
        const targetDate = new Date(date);
        targetDate.setUTCHours(0, 0, 0, 0);

        const score = await ProductivityScore.findOne({ userId, date: targetDate });
        return score || { score: 0, deepFocusMinutes: 0, taskCompletionRate: 0, consistencyStreak: 0 };
    }

    /**
     * Get weekly productivity score trend with zero-filled gaps.
     */
    static async getWeeklyTrend(userId) {
        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setUTCHours(0, 0, 0, 0);
            date.setDate(date.getDate() - i);

            const score = await ProductivityScore.findOne({
                userId,
                date: { $gte: date, $lt: new Date(date).setDate(date.getDate() + 1) }
            });

            trend.push(score || {
                date,
                score: 0,
                deepFocusMinutes: 0,
                taskCompletionRate: 0,
                consistencyStreak: 0
            });
        }
        return trend;
    }

    /**
     * Get the latest burnout risk evaluation.
     */
    static async getLatestBurnoutRisk(userId) {
        return await BurnoutLog.findOne({ userId }).sort({ evaluatedAt: -1 });
    }

    /**
     * Get per-subject focus efficiency.
     */
    static async getSubjectEfficiency(userId) {
        return await Session.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$subject',
                    avgFocus: { $avg: '$focusRating' },
                    totalDuration: { $sum: '$duration' },
                },
            },
        ]);
    }

    /**
     * Get combined history of recent activities.
     */
    static async getRecentActivities(userId, limit = 5) {
        const [sessions, tasks] = await Promise.all([
            Session.find({ userId }).sort({ startedAt: -1 }).limit(limit),
            Task.find({ userId, completed: true }).sort({ updatedAt: -1 }).limit(limit)
        ]);

        const activities = [
            ...sessions.map(s => ({
                id: s._id,
                type: 'session',
                title: `Focused on ${s.subject}`,
                description: `${s.duration} minutes · ${s.focusRating}/10 Focus`,
                time: s.startedAt,
            })),
            ...tasks.map(t => ({
                id: t._id,
                type: 'task',
                title: `Completed: ${t.title}`,
                description: `${t.subject} · ${t.difficulty}`,
                time: t.updatedAt,
            }))
        ];

        return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, limit);
    }

    /**
     * Get analytics overview stats combining Sessions and Tasks
     */
    static async getOverview(userId) {
        // Use UTC dates to match how session.date is stored (YYYY-MM-DD in UTC)
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        const sessions = await Session.find({ userId, status: 'completed' });
        const tasks = await Task.find({ userId });

        let todayFocusMinutes = 0;
        let weeklyFocusMinutes = 0;
        const sessionsCompleted = sessions.length;

        const subjectMap = {};
        const dailyMap = {};

        // Initialize dailyMap for last 7 days to 0 (oldest → newest)
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setUTCDate(d.getUTCDate() - i);
            const dStr = d.toISOString().split('T')[0];
            dailyMap[dStr] = 0;
        }

        sessions.forEach(s => {
            if (s.date === todayStr) {
                todayFocusMinutes += s.duration;
            }
            if (s.date >= sevenDaysAgoStr) {
                weeklyFocusMinutes += s.duration;
                if (dailyMap[s.date] !== undefined) {
                    dailyMap[s.date] += s.duration;
                }
            }
            // Subject grouping across all completed sessions
            if (!subjectMap[s.subject]) subjectMap[s.subject] = 0;
            subjectMap[s.subject] += s.duration;
        });

        const subjectDistribution = Object.keys(subjectMap).map(subject => ({
            subject,
            minutes: subjectMap[subject]
        }));

        const dailyFocus = Object.keys(dailyMap).map(date => ({
            date,
            minutes: dailyMap[date]
        }));

        let tasksCompleted = 0;
        tasks.forEach(t => {
            if (t.completed) tasksCompleted++;
        });

        const taskCompletionRate = tasks.length > 0 ? Math.round((tasksCompleted / tasks.length) * 100) : 0;

        return {
            todayFocusMinutes,
            weeklyFocusMinutes,
            sessionsCompleted,
            tasksCompleted,
            taskCompletionRate,
            subjectDistribution,
            dailyFocus
        };
    }
}

export default AnalyticsService;
