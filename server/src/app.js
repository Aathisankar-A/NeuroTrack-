import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';

import { env } from './config/env.js';
import errorMiddleware from './middleware/error.middleware.js';
import ApiResponse from './utils/apiResponse.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import sessionRoutes from './routes/session.routes.js';
import taskRoutes from './routes/task.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import aiRoutes from './routes/ai.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import resourceRoutes from './routes/resource.routes.js';
import roomRoutes from './routes/room.routes.js';
import classroomRoutes from './routes/classroom.routes.js';

// Load background jobs
import './jobs/index.js';

/**
 * Express Application Setup.
 */
const app = express();

// 0. Trust Proxy (Required for Render/Vercel)
app.set('trust proxy', 1);

// 1. Security Middleware
app.use(helmet());

// CORS: allow requests from the configured frontend URL.
// FRONTEND_URL must be set to your Vercel deployment URL in production,
// e.g. https://neurotrack.vercel.app
// Multiple origins can be supported by splitting a comma-separated env var.
const allowedOrigins = env.FRONTEND_URL
    ? env.FRONTEND_URL.split(',').map(o => o.trim())
    : ['http://localhost:5173'];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (curl, Postman, server-to-server)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error(`CORS: origin ${origin} not allowed`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Handle pre-flight OPTIONS requests for all routes
app.options('*', cors());

// 2. Body Parsers & Security
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(cookieParser());

// 2.1 Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === 'development' ? 1000 : 100, // Be more lenient in development
    message: ApiResponse.error('Too many requests, please try again later', 429),
});
app.use('/api', limiter);

// 3. Optimization & Logging
app.use(compression());
if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/classrooms', classroomRoutes);

// 5. Health Check
app.get('/api/health', (req, res) => {
    res.json(ApiResponse.success({ status: 'OK' }, 'Server is healthy'));
});

// 6. 404 Handler
app.use('*', (req, res) => {
    res.status(404).json(ApiResponse.error('Resource not found', 404));
});

// 7. Error Middleware
app.use(errorMiddleware);

export default app;
