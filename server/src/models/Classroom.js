import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a classroom name'],
            trim: true,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        inviteCode: {
            type: String,
            unique: true,
            required: true,
        },
        subject: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Classroom', classroomSchema);
