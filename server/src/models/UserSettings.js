import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        dailyFocusGoal: {
            type: Number, // in minutes
            default: 120, // 2 hours default
        },
        dailyTaskGoal: {
            type: Number,
            default: 5,
        },
        weeklyGoal: {
            type: Number, // total minutes per week
            default: 600,
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'light',
        },
        aiInsightsEnabled: {
            type: Boolean,
            default: true,
        },
        notificationsEnabled: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('UserSettings', userSettingsSchema);
