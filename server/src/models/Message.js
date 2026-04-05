import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: [true, 'Room ID is required']
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Sender is required']
        },
        content: {
            type: String,
            required: [true, 'Message content is required'],
            trim: true
        },
        type: {
            type: String,
            enum: ['text', 'system', 'code', 'resource'],
            default: 'text'
        }
    },
    {
        timestamps: true
    }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
