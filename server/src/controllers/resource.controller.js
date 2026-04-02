import ResourceService from '../services/resource.service.js';
import ApiResponse from '../utils/apiResponse.js';

class ResourceController {
    /**
     * @route POST /api/resources/collections
     * @access Private
     */
    static async createCollection(req, res, next) {
        try {
            const { title } = req.body;
            
            if (!title) {
                return res.status(400).json(ApiResponse.error('Please provide a title for the collection', 400));
            }

            const collection = await ResourceService.createCollection(req.user._id, title);
            res.status(201).json(ApiResponse.success(collection, 'Collection created successfully', 201));
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route GET /api/resources/collections
     * @access Private
     */
    static async getCollections(req, res, next) {
        try {
            const collections = await ResourceService.getCollections(req.user._id);
            res.status(200).json(ApiResponse.success(collections, 'Collections retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route POST /api/resources
     * @access Private
     */
    static async addResource(req, res, next) {
        try {
            const { collectionId, title, type, url, notes } = req.body;

            if (!collectionId || !title || !type) {
                return res.status(400).json(ApiResponse.error('Please provide collectionId, title, and type', 400));
            }

            const resource = await ResourceService.addResource(req.user._id, collectionId, {
                title, type, url, notes
            });

            res.status(201).json(ApiResponse.success(resource, 'Resource added successfully', 201));
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route GET /api/resources/:collectionId
     * @access Private
     */
    static async getResourcesByCollection(req, res, next) {
        try {
            const { collectionId } = req.params;
            const resources = await ResourceService.getResourcesByCollection(req.user._id, collectionId);
            res.status(200).json(ApiResponse.success(resources, 'Resources retrieved successfully'));
        } catch (error) {
            next(error);
        }
    }
}

export default ResourceController;
