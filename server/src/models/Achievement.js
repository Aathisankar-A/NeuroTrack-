import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['STREAK', 'FOCUS_MINUTES', 'TASKS_COMPLETED', 'LEVEL_REACHED', 'SPECIAL'],
        },
        badgeId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: String,
        icon: String, // lucide icon name
        earnedAt: {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate badges for the same achievement
achievementSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export default mongoose.model('Achievement', achievementSchema);
