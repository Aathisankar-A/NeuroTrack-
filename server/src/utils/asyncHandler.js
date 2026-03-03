/**
 * Standardizes async route handlers to avoid try-catch blocks.
 * @param {Function} fn - Async functionality to be wrapped.
 * @returns {Function} - Express middleware wrapper.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
