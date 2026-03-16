import UserSettings from '../models/UserSettings.js';

class SettingsService {
    /**
     * Get settings for a user.
     */
    static async getSettings(userId) {
        let settings = await UserSettings.findOne({ userId });

        // Ensure settings exist (fallback for old users)
        if (!settings) {
            settings = await UserSettings.create({ userId });
        }

        return settings;
    }

    /**
     * Update user settings.
     */
    static async updateSettings(userId, updateData) {
        const allowedUpdates = [
            'dailyFocusGoal',
            'dailyTaskGoal',
            'weeklyGoal',
            'theme',
            'aiInsightsEnabled',
            'notificationsEnabled'
        ];

        const filteredUpdate = {};
        Object.keys(updateData).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                filteredUpdate[key] = updateData[key];
            }
        });

        return await UserSettings.findOneAndUpdate(
            { userId },
            { $set: filteredUpdate },
            { new: true, upsert: true }
        );
    }
}

export default SettingsService;
