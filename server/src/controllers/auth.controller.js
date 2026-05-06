import AuthService from '../services/auth.service.js';
import EmailService from '../services/email.service.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import { env } from '../config/env.js';

/**
 * Authentication controllers.
 */
class AuthController {
    static register = asyncHandler(async (req, res) => {
        const user = await AuthService.registerUser(req.body);
        res.status(201).json(ApiResponse.success({ id: user._id, email: user.email }, 'User registered successfully'));
    });

    static login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await AuthService.loginUser(email, password);

        // Set tokens in HttpOnly cookies
        // sameSite: 'lax' works for same-site (Vercel frontend + Vercel API functions)
        // If ever split to separate domains, change to 'none' + secure: true
        const cookieOptions = {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        };

        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000, // 15 mins
        });

        res.json(ApiResponse.success({ user: { id: user._id, name: user.name, role: user.role } }, 'Login successful'));
    });

    static refresh = asyncHandler(async (req, res) => {
        const { refreshToken } = req.cookies;
        const { accessToken, newRefreshToken } = await AuthService.rotateTokens(refreshToken);

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000,
        });

        res.json(ApiResponse.success(null, 'Token refreshed successfully'));
    });

    static logout = asyncHandler(async (req, res) => {
        if (req.user) {
            await AuthService.logoutUser(req.user.id);
        }
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.json(ApiResponse.success(null, 'Logged out successfully'));
    });

    static getMe = asyncHandler(async (req, res) => {
        res.json(ApiResponse.success(req.user, 'User profile fetched'));
    });

    static forgotPassword = asyncHandler(async (req, res) => {
        const { email } = req.body;
        const token = await AuthService.forgotPassword(email);

        try {
            await EmailService.sendResetPasswordEmail(email, token);
            res.json(ApiResponse.success(null, 'Reset email sent'));
        } catch (err) {
            // Cleanup token if email fails
            await User.findOneAndUpdate({ email }, { resetToken: null, resetTokenExpiry: null });
            throw { statusCode: 500, message: 'Failed to send email' };
        }
    });

    static resetPassword = asyncHandler(async (req, res) => {
        const { token } = req.params;
        const { password } = req.body;

        await AuthService.resetPassword(token, password);
        res.json(ApiResponse.success(null, 'Password reset successful'));
    });
}

export default AuthController;
