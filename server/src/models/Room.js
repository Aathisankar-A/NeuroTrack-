import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Room name is required'],
            trim: true,
            maxlength: [50, 'Room name cannot exceed 50 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Description cannot exceed 200 characters'],
        },
        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Room host is required'],
        },
        participants: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
                role: {
                    type: String,
                    enum: ['host', 'member'],
                    default: 'member',
                },
            },
        ],
        type: {
            type: String,
            enum: ['public', 'private'],
            default: 'public',
        },
        inviteCode: {
            type: String,
            unique: true,
        },
        mode: {
            type: String,
            enum: ['solo-focus', 'collaborative', 'teach', 'silent-library'],
            default: 'collaborative',
        },
        maxParticipants: {
            type: Number,
            default: 20,
            max: [50, 'Maximum 50 participants allowed'],
        },
        timer: {
            duration: {
                type: Number, // in minutes
                default: 25,
            },
            startedAt: {
                type: Date,
            },
            status: {
                type: String,
                enum: ['idle', 'running', 'paused'],
                default: 'idle',
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Generate unique invite code before saving if not present
roomSchema.pre('save', async function (next) {
    if (!this.inviteCode) {
        this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
