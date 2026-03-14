import User from '../models/User.js';
import { emitToUser } from '../config/socket.js';

class LevelService {
    static RANKS = [
        { minLevel: 1, name: 'Cognitive Novice', color: 'text-gray-500' },
        { minLevel: 5, name: 'Mental Adept', color: 'text-blue-500' },
        { minLevel: 10, name: 'Focus Master', color: 'text-purple-500' },
        { minLevel: 20, name: 'Brain Architect', color: 'text-orange-500' },
        { minLevel: 50, name: 'Visionary', color: 'text-primary-600' }
    ];

    /**
     * Calculate XP required for a given level.
     * exponential growth formula: 100 * (1.5)^(level-1)
     */
    static getXpForLevel(level) {
        if (level <= 1) return 0;
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }

    /**
     * Get rank based on level.
     */
    static getRank(level) {
        return [...this.RANKS].reverse().find(r => level >= r.minLevel) || this.RANKS[0];
    }

    /**
     * Award XP to a user and handle level ups.
     */
    static async awardXp(userId, xpAmount) {
        const user = await User.findById(userId);
        if (!user) return null;

        user.xp += xpAmount;

        let leveledUp = false;
        while (true) {
            const nextLevelXp = this.getXpForLevel(user.level + 1);
            if (user.xp >= nextLevelXp) {
                user.level += 1;
                leveledUp = true;
            } else {
                break;
            }
        }

        await user.save();

        const result = {
            level: user.level,
            xp: user.xp,
            leveledUp,
            rank: this.getRank(user.level)
        };

        if (leveledUp) {
            emitToUser(userId, 'levelUp', result);
        }

        return result;
    }
}

export default LevelService;
