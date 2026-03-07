import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Please provide a task title'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        subject: {
            type: String,
            required: [true, 'Please provide a subject'],
            trim: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['pending', 'completed'],
            default: 'pending',
        },
        notes: {
            type: String,
            trim: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        timeSpent: {
            type: Number, // In minutes
            default: 0,
        },
        dueDate: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for task completion rate calculation
taskSchema.index({ userId: 1, completed: 1 });

export default mongoose.model('Task', taskSchema);
