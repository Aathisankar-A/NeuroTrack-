import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        subject: {
            type: String,
            required: [true, 'Please provide a subject'],
            trim: true,
        },
        date: {
            type: String, // YYYY-MM-DD
            required: [true, 'Please provide a date'],
        },
        startTime: {
            type: String, // HH:mm
            required: [true, 'Please provide a start time'],
        },
        duration: {
            type: Number, // In minutes
            required: [true, 'Please provide duration'],
            min: [1, 'Duration must be at least 1 minute'],
        },
        status: {
            type: String,
            enum: ['scheduled', 'active', 'paused', 'completed', 'stopped early', 'abandoned', 'missed', 'running'],
            default: 'scheduled',
        },
        focusRating: {
            type: Number,
            min: 1,
            max: 10,
        },
        energyLevel: {
            type: Number,
            min: 1,
            max: 10,
        },
        distractionCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        startedAt: {
            type: Date,
            index: true,
        },
        endedAt: {
            type: Date,
        },
        plannedDuration: {
            type: Number,
        },
        actualDuration: {
            type: Number,
            default: 0,
        },
        completionPercentage: {
            type: Number,
            default: 0,
        },
        actualStartTime: Date,
        actualEndTime: Date,
        pausedAt: Date,
        pausedTime: {
            type: Number, // Total paused duration in seconds
            default: 0,
        },
        tasks: [{
            title: { type: String, required: true },
            completed: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
            completedAt: { type: Date }
        }],
        attachedResources: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resource'
        }],
    },
    {
        timestamps: true,
    }
);

// Index for analytics: Sort by user and start time
sessionSchema.index({ userId: 1, startedAt: -1 });
sessionSchema.index({ userId: 1, date: 1 });

export default mongoose.model('Session', sessionSchema);
