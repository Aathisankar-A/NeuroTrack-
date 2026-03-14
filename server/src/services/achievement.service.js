import Achievement from '../models/Achievement.js';
import { emitToUser } from '../config/socket.js';

class AchievementService {
    static BADGES = {
        STREAK_7: { type: 'STREAK', title: '7-Day Warrior', description: 'Maintained a 7-day productivity streak', icon: 'Flame' },
        FOCUS_1000: { type: 'FOCUS_MINUTES', title: 'Deep Diver', description: 'Reached 1,000 minutes of deep focus', icon: 'Zap' },
        TASKS_50: { type: 'TASKS_COMPLETED', title: 'Task Crusher', description: 'Completed 50 tasks', icon: 'CheckCircle2' },
        LEVEL_10: { type: 'LEVEL_REACHED', title: 'Focus Master', description: 'Reached Cognitive Level 10', icon: 'Trophy' },
    };

    /**
     * Check and award achievements based on user stats.
     */
    static async checkAchievements(userId, stats) {
        const earned = [];

        // 1. Check Streak
        if (stats.streak >= 7) {
            earned.push(await this.awardBadge(userId, 'STREAK_7'));
        }

        // 2. Check Focus Minutes
        if (stats.deepFocusMinutes >= 1000) {
            earned.push(await this.awardBadge(userId, 'FOCUS_1000'));
        }

        // 3. Check Tasks
        if (stats.totalCompletedTasks >= 50) {
            earned.push(await this.awardBadge(userId, 'TASKS_50'));
        }

        // 4. Check Level
        if (stats.level >= 10) {
            earned.push(await this.awardBadge(userId, 'LEVEL_10'));
        }

        return earned.filter(Boolean);
    }

    /**
     * Internal method to save achievement if not already earned.
     */
    static async awardBadge(userId, badgeId) {
        if (!this.BADGES[badgeId]) return null;

        const alreadyEarned = await Achievement.findOne({ userId, badgeId });
        if (alreadyEarned) return null;

        const badge = this.BADGES[badgeId];
        const achievement = await Achievement.create({
            userId,
            badgeId,
            ...badge
        });

        emitToUser(userId, 'achievementEarned', achievement);
        return achievement;
    }

    /**
     * Get all achievements for a user.
     */
    static async getUserAchievements(userId) {
        return await Achievement.find({ userId }).sort({ earnedAt: -1 });
    }
}

export default AchievementService;
