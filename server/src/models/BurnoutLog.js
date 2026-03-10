import mongoose from 'mongoose';

const burnoutLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        evaluatedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        riskLevel: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            required: true,
        },
        riskScore: {
            type: Number,
            required: true,
        },
        factors: {
            energyDecline: { type: Boolean, default: false },
            highWorkload: { type: Boolean, default: false },
            productivityDrop: { type: Boolean, default: false },
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('BurnoutLog', burnoutLogSchema);
