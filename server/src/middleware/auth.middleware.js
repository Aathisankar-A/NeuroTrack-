import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Verifies JWT access token.
 */
export const protect = asyncHandler(async (req, res, next) => {
    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw { statusCode: 401, message: 'Not authorized to access this route' };
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            throw { statusCode: 401, message: 'User not found' };
        }

        next();
    } catch (err) {
        // Re-throw structured errors (e.g. user not found) as-is; wrap JWT errors
        if (err.statusCode) throw err;
        throw { statusCode: 401, message: 'Not authorized - Token failed' };
    }
});

/**
 * Restricts access to specific roles.
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw { statusCode: 403, message: `User role ${req.user.role} is not authorized` };
        }
        next();
    };
};
