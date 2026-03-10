import mongoose from 'mongoose';

const productivityScoreSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        date: {
            type: Date,
            required: true,
            index: true,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        deepFocusMinutes: {
            type: Number,
            default: 0,
        },
        taskCompletionRate: {
            type: Number, // 0.0 - 1.0
            default: 0,
        },
        consistencyStreak: {
            type: Number,
            default: 0,
        },
        distractionPenalty: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Unique score per user per day (normalized to midnight UTC)
productivityScoreSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('ProductivityScore', productivityScoreSchema);
