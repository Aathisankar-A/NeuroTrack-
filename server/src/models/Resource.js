import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
    {
        collectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ResourceCollection',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Please provide a resource title'],
            trim: true,
            maxlength: [150, 'Title cannot be more than 150 characters'],
        },
        type: {
            type: String,
            enum: ['link', 'note'],
            required: [true, 'Please specify if this is a link or note'],
            default: 'link'
        },
        url: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Resource', resourceSchema);
