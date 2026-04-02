import mongoose from 'mongoose';

const resourceCollectionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Please provide a collection title'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('ResourceCollection', resourceCollectionSchema);
