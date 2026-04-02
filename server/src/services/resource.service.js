import ResourceCollection from '../models/ResourceCollection.js';
import Resource from '../models/Resource.js';

class ResourceService {
    /**
     * Create a new resource collection for a user
     */
    static async createCollection(userId, title) {
        const collection = await ResourceCollection.create({
            userId,
            title
        });
        return collection;
    }

    /**
     * Get all collections for a user
     */
    static async getCollections(userId) {
        const collections = await ResourceCollection.find({ userId }).sort({ createdAt: -1 });
        return collections;
    }

    /**
     * Add a resource to a collection
     */
    static async addResource(userId, collectionId, resourceData) {
        // First verify the collection belongs to the user
        const collection = await ResourceCollection.findOne({ _id: collectionId, userId });
        
        if (!collection) {
            const error = new Error('Resource collection not found or unauthorized');
            error.statusCode = 404;
            throw error;
        }

        const resource = await Resource.create({
            collectionId,
            ...resourceData
        });

        return resource;
    }

    /**
     * Get all resources for a specific collection
     */
    static async getResourcesByCollection(userId, collectionId) {
        // Verify ownership
        const collection = await ResourceCollection.findOne({ _id: collectionId, userId });
        
        if (!collection) {
            const error = new Error('Resource collection not found or unauthorized');
            error.statusCode = 404;
            throw error;
        }

        const resources = await Resource.find({ collectionId }).sort({ createdAt: -1 });
        return resources;
    }
}

export default ResourceService;
