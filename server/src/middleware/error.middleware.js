import ApiResponse from '../utils/apiResponse.js';
import { env } from '../config/env.js';

/**
 * Centralized error handling middleware.
 */
const errorMiddleware = (err, req, res, next) => {
    let { statusCode, message } = err;

    // Set defaults
    statusCode = statusCode || 500;
    message = message || 'Internal Server Error';

    // Handle Mongoose / Zod / JWT errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(', ');
    } else if (err.name === 'CastError') {
        statusCode = 404;
        message = `Resource not found: ${err.value}`;
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please login again.';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please login again.';
    }

    // Log error for debugging in development
    if (env.NODE_ENV === 'development') {
        console.error(`[ERROR] ${req.method} ${req.url} - ${err.stack || message}`);
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        error: message,
        stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

export default errorMiddleware;
