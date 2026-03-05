import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import UserSettings from '../models/UserSettings.js';
import { env } from '../config/env.js';

/**
 * Business logic for authentication.
 */
class AuthService {
    /**
     * Generates Access and Refresh tokens.
     */
    static generateTokens(user) {
        const accessToken = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, {
            expiresIn: env.JWT_ACCESS_EXPIRY,
        });

        const refreshToken = jwt.sign({ id: user._id }, env.JWT_REFRESH_SECRET, {
            expiresIn: env.JWT_REFRESH_EXPIRY,
        });

        return { accessToken, refreshToken };
    }

    /**
     * Hashed refresh token for DB storage.
     */
    static async hashRefreshToken(token) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(token, salt);
    }

    /**
     * Register a new user.
     */
    static async registerUser(userData) {
        const { name, email, password } = userData;
        const user = await User.create({ name, email, password });

        // Initialize default settings
        await UserSettings.create({ userId: user._id });

        return user;
    }

    /**
     * Login user and return tokens.
     */
    static async loginUser(email, password) {
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            throw { statusCode: 401, message: 'Invalid credentials' };
        }

        const { accessToken, refreshToken } = this.generateTokens(user);
        const hashedRefresh = await this.hashRefreshToken(refreshToken);

        user.refreshToken = hashedRefresh;
        await user.save();

        return { user, accessToken, refreshToken };
    }

    /**
     * Refreshes the access token using a valid refresh token.
     * Implements strict rotation for production security.
     */
    static async rotateTokens(cookieToken) {
        if (!cookieToken) {
            throw { statusCode: 401, message: 'Session expired. Please login again.' };
        }

        let payload;
        try {
            payload = jwt.verify(cookieToken, env.JWT_REFRESH_SECRET);
        } catch (err) {
            // Potential refresh token theft: if token is invalid/expired but exists, we should clear it
            throw { statusCode: 401, message: 'Invalid or expired session' };
        }

        const user = await User.findById(payload.id).select('+refreshToken');
        if (!user || !user.refreshToken) {
            throw { statusCode: 401, message: 'Account not found or logged out' };
        }

        // Compare with hashed version in DB
        const isMatch = await bcrypt.compare(cookieToken, user.refreshToken);
        if (!isMatch) {
            // ERROR: REFRESH TOKEN REUSE DETECTED
            // For production, we should clear the user's sessions entirely as a security measure
            await User.findByIdAndUpdate(payload.id, { refreshToken: null });
            throw { statusCode: 403, message: 'Security breach detected. All sessions terminated.' };
        }

        // Generate new pair
        const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);

        // Hash and store new refresh token
        user.refreshToken = await this.hashRefreshToken(newRefreshToken);
        await user.save();

        return { accessToken, newRefreshToken };
    }

    /**
     * Logout user and clear tokens.
     */
    static async logoutUser(userId) {
        await User.findByIdAndUpdate(userId, { refreshToken: null });
    }

    /**
     * Generates a password reset token and saves it to the user.
     */
    static async forgotPassword(email) {
        const user = await User.findOne({ email });
        if (!user) throw { statusCode: 404, message: 'User not found' };

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');

        // Hash and store
        user.resetToken = crypto.createHash('sha256').update(token).digest('hex');
        user.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();
        return token;
    }

    /**
     * Resets password using a valid token.
     */
    static async resetPassword(token, newPassword) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) throw { statusCode: 400, message: 'Invalid or expired reset token' };

        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();
    }
}

export default AuthService;
