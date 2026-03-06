import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import validate from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.schema.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Public routes
 */
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), AuthController.resetPassword);

/**
 * Protected routes
 */
router.post('/logout', protect, AuthController.logout);
router.get('/me', protect, AuthController.getMe);

export default router;
