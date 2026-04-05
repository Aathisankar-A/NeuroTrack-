import mongoose from 'mongoose';

const duelSchema = new mongoose.Schema(
    {
        challenger: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        opponent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
        },
        duration: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'completed', 'cancelled'],
            default: 'pending',
        },
        results: {
            challengerScore: { type: Number, default: 0 },
            opponentScore: { type: Number, default: 0 },
        },
        winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Duel', duelSchema);
