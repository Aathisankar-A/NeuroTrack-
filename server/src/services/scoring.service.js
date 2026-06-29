import Session from '../models/Session.js';
import Task from '../models/Task.js';
import ProductivityScore from '../models/ProductivityScore.js';
import LevelService from './level.service.js';
import AchievementService from './achievement.service.js';
import User from '../models/User.js';

class ScoringService {
    /**
     * Calculates productivity score for a specific user and date.
     * Formula: (deepFocusMinutes * 0.5) + (taskCompletionRate * 30) + (streak * 2) - (distractions * 2)
     */
    static async calculateDailyScore(userId, date) {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // 1. Get focus sessions for the day
        const sessions = await Session.find({
            userId,
            startedAt: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['completed', 'stopped early', 'abandoned'] }
        });

        const deepFocusMinutes = sessions.reduce((sum, s) => {
            const actual = s.actualDuration !== undefined ? s.actualDuration : (s.status === 'completed' ? s.duration : 0);
            return sum + actual;
        }, 0);
        const totalDistractions = sessions.reduce((sum, s) => sum + s.distractionCount, 0);

        // 2. Get tasks for the day
        // Tasks created before or during today AND (incomplete OR completed today)
        const totalTasks = await Task.countDocuments({
            userId,
            createdAt: { $lte: endOfDay },
            $or: [
                { completed: false },
                { completedAt: { $gte: startOfDay, $lte: endOfDay } }
            ],
        });

        const completedTasks = await Task.countDocuments({
            userId,
            completed: true,
            completedAt: { $gte: startOfDay, $lte: endOfDay },
        });

        const taskCompletionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

        // 3. Calculate actual streak
        const consistencyStreak = await this.calculateStreak(userId, startOfDay);

        // 4. Apply formula (Refined weights)
        // Max theoretical: (300m * 0.5 = 150) + (1 * 30 = 30) + (10 * 2 = 20) = 200
        // We'll clamp this to 100 for the final score.
        let rawScore =
            deepFocusMinutes * 0.5 +
            taskCompletionRate * 30 +
            Math.min(consistencyStreak, 10) * 2 - // Cap streak bonus at 10 days
            totalDistractions * 2;

        // Clamp 0-100
        const score = Math.max(0, Math.min(100, Math.round(rawScore)));

        // 5. UPSERT score record
        const updatedScore = await ProductivityScore.findOneAndUpdate(
            { userId, date: startOfDay },
            {
                score,
                deepFocusMinutes,
                taskCompletionRate,
                consistencyStreak,
                distractionPenalty: totalDistractions * 2,
            },
            { upsert: true, new: true }
        );

        // 6. Award XP based on daily performance
        const xpToAward = score * 2;
        const levelUpdate = await LevelService.awardXp(userId, xpToAward);

        // 7. Check for Achievements
        const totalCompletedTasks = await Task.countDocuments({ userId, completed: true });
        await AchievementService.checkAchievements(userId, {
            streak: consistencyStreak,
            deepFocusMinutes: deepFocusMinutes,
            totalCompletedTasks,
            level: levelUpdate.level
        });

        return updatedScore;
    }

    /**
     * Calculates consecutive days with a productivity score > 0.
     * Fetches up to 366 days of scores in a single query instead of N+1 queries.
     */
    static async calculateStreak(userId, currentDate) {
        const startDate = new Date(currentDate);
        startDate.setUTCHours(0, 0, 0, 0);

        // Fetch all scores for the past 366 days in one query
        const cutoff = new Date(startDate);
        cutoff.setUTCDate(cutoff.getUTCDate() - 365);

        const scores = await ProductivityScore.find({
            userId,
            date: { $gte: cutoff, $lte: startDate },
            score: { $gt: 0 },
        }).select('date').lean();

        // Build a Set of date strings for O(1) lookup
        const scoredDays = new Set(scores.map(s => s.date.toISOString().split('T')[0]));

        let streak = 0;
        let checkDate = new Date(startDate);

        while (streak <= 365) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (scoredDays.has(dateStr)) {
                streak++;
                checkDate.setUTCDate(checkDate.getUTCDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }
}

export default ScoringService;
