/**
 * Standardizes pagination logic for Mongoose models.
 * @param {mongoose.Model} model - The Mongoose model to query.
 * @param {Object} filter - The filter object for the query.
 * @param {Object} options - Pagination options (page, limit, sort, populate).
 * @returns {Promise<Object>} - Paginated results with metadata.
 */
const paginate = async (model, filter = {}, options = {}) => {
    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 20));
    const skip = (page - 1) * limit;

    const query = model.find(filter).skip(skip).limit(limit).sort(options.sort || { createdAt: -1 });

    if (options.populate) {
        query.populate(options.populate);
    }

    const [data, total] = await Promise.all([query.exec(), model.countDocuments(filter)]);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export default paginate;
