import Session from '../models/Session.js';
import paginate from '../utils/paginate.js';
import ScoringService from './scoring.service.js';
import BurnoutService from './burnout.service.js';

class SessionService {
    static async createSession(userId, sessionData) {
        const { date, startTime, duration } = sessionData;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // 1. Prevent scheduling in the past
        if (date < todayStr) {
            throw { statusCode: 400, message: 'Cannot schedule sessions in the past' };
        }

        // 2. Prevent session time overlap
        const existingSessions = await Session.find({ userId, date });

        const newStart = this._timeToMinutes(startTime);
        const newEnd = newStart + duration;

        for (const session of existingSessions) {
            const existStart = this._timeToMinutes(session.startTime);
            const existEnd = existStart + session.duration;

            // Overlap condition: (StartA < EndB) and (EndA > StartB)
            if (newStart < existEnd && newEnd > existStart) {
                throw { statusCode: 400, message: 'Session time conflicts with another scheduled session' };
            }
        }

        const durationValue = sessionData.duration || sessionData.plannedDuration;
        return await Session.create({
            ...sessionData,
            userId,
            duration: durationValue,
            plannedDuration: durationValue,
            actualDuration: 0,
            completionPercentage: 0,
            status: 'scheduled',
        });
    }

    // Helper to convert HH:mm to minutes from midnight
    static _timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    static async startSession(userId, sessionId) {
        const session = await Session.findOne({ _id: sessionId, userId });
        if (!session) throw { statusCode: 404, message: 'Session not found' };
        if (session.status !== 'scheduled') throw { statusCode: 400, message: 'Only scheduled sessions can be started' };

        session.status = 'active';
        session.actualStartTime = new Date();
        session.startedAt = session.actualStartTime; // Backwards compatibility
        await session.save();
        return session;
    }

    static async pauseSession(userId, sessionId) {
        const session = await Session.findOne({ _id: sessionId, userId });
        if (!session) throw { statusCode: 404, message: 'Session not found' };
        if (session.status !== 'active' && session.status !== 'running') throw { statusCode: 400, message: 'Only active sessions can be paused' };

        session.status = 'paused';
        session.pausedAt = new Date();
        await session.save();
        return session;
    }

    static async resumeSession(userId, sessionId) {
        const session = await Session.findOne({ _id: sessionId, userId });
        if (!session) throw { statusCode: 404, message: 'Session not found' };
        if (session.status !== 'paused') throw { statusCode: 400, message: 'Only paused sessions can be resumed' };

        const pauseDurationSeconds = Math.floor((new Date() - new Date(session.pausedAt)) / 1000);
        session.pausedTime += pauseDurationSeconds;
        session.status = 'active';
        await session.save();
        return session;
    }

    static async completeSession(userId, sessionId, completionData) {
        const session = await Session.findOne({ _id: sessionId, userId });
        if (!session) throw { statusCode: 404, message: 'Session not found' };

        const { focusRating, energyLevel, distractionCount } = completionData;

        session.actualEndTime = new Date();
        session.endedAt = session.actualEndTime;
        session.focusRating = focusRating;
        session.energyLevel = energyLevel;
        session.distractionCount = distractionCount || 0;

        const startTime = session.actualStartTime || session.startedAt || new Date();
        const endTime = session.actualEndTime;
        const elapsedSeconds = Math.max(0, Math.floor((endTime - startTime) / 1000) - (session.pausedTime || 0));
        const actualDuration = Math.round(elapsedSeconds / 60);

        session.actualDuration = actualDuration;

        const plannedDuration = session.plannedDuration || session.duration || 30;
        const completionPercentage = Math.min(100, Math.round((actualDuration / plannedDuration) * 100));
        session.completionPercentage = completionPercentage;

        if (actualDuration === 0) {
            session.status = 'abandoned';
        } else if (actualDuration >= plannedDuration) {
            session.status = 'completed';
        } else {
            session.status = 'stopped early';
        }

        await session.save();

        // Trigger scoring recalculation and burnout evaluation
        await ScoringService.calculateDailyScore(userId, session.actualEndTime);
        await BurnoutService.evaluateBurnoutRisk(userId);

        return session;
    }

    static async getSessions(userId, queryOptions) {
        // Handle "missed" status for scheduled sessions that passed their time
        const now = new Date();
        const scheduledSessions = await Session.find({ userId, status: 'scheduled' });

        for (const session of scheduledSessions) {
            const sessionTime = new Date(`${session.date}T${session.startTime}`);
            // If session was scheduled for more than 15 mins ago and not started
            if (now > new Date(sessionTime.getTime() + 15 * 60000)) {
                session.status = 'abandoned';
                session.actualDuration = 0;
                session.completionPercentage = 0;
                await session.save();
            }
        }

        const filter = { userId };

        if (queryOptions.date) {
            filter.date = queryOptions.date;
        } else if (queryOptions.startDate || queryOptions.endDate) {
            filter.startedAt = {};
            if (queryOptions.startDate) filter.startedAt.$gte = new Date(queryOptions.startDate);
            if (queryOptions.endDate) filter.startedAt.$lte = new Date(queryOptions.endDate);
        }

        if (queryOptions.subject) {
            filter.subject = { $regex: queryOptions.subject, $options: 'i' };
        }

        return await paginate(Session, filter, queryOptions);
    }

    static async getSessionById(userId, sessionId) {
        const session = await Session.findOne({ _id: sessionId, userId });
        if (!session) throw { statusCode: 404, message: 'Session not found' };
        return session;
    }

    static async deleteSession(userId, sessionId) {
        const result = await Session.deleteOne({ _id: sessionId, userId });
        if (result.deletedCount === 0) throw { statusCode: 404, message: 'Session not found' };
        return true;
    }

    // --- Embedded Tasks Logic ---
    static async addTask(userId, sessionId, title) {
        const session = await Session.findOne({ _id: sessionId, userId });
        if (!session) throw { statusCode: 404, message: 'Session not found' };
        
        if (!title || !title.trim()) throw { statusCode: 400, message: 'Task title is required' };
        
        session.tasks.push({ title: title.trim() });
        await session.save();
        return session;
    }

    static async toggleTask(userId, sessionId, taskId) {
        const session = await Session.findOne({ _id: sessionId, userId });
        if (!session) throw { statusCode: 404, message: 'Session not found' };

        const task = session.tasks.id(taskId);
        if (!task) throw { statusCode: 404, message: 'Task not found in session' };

        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date() : null;
        await session.save();
        return session;
    }

    static async deleteTask(userId, sessionId, taskId) {
        const session = await Session.findOne({ _id: sessionId, userId });
        if (!session) throw { statusCode: 404, message: 'Session not found' };

        session.tasks.pull(taskId);
        await session.save();
        return session;
    }

    static async checkPreviousUnfinished(userId, sessionId) {
        const session = await Session.findOne({ _id: sessionId, userId });
        if (!session) throw { statusCode: 404, message: 'Session not found' };

        const previousSession = await Session.findOne({ 
            userId, 
            subject: session.subject,
            createdAt: { $lt: session.createdAt }
        }).sort({ createdAt: -1 });

        if (previousSession && previousSession.tasks && previousSession.tasks.length > 0) {
            const unfinishedTasks = previousSession.tasks.filter(t => !t.completed);
            
            // Filter ones that haven't been copied
            const pendingToCarry = unfinishedTasks.filter(oldT => 
                !session.tasks.some(t => t.title.toLowerCase() === oldT.title.toLowerCase())
            );
            return pendingToCarry;
        }
        return [];
    }

    static async carryForwardTasks(userId, sessionId) {
        const session = await Session.findOne({ _id: sessionId, userId });
        if (!session) throw { statusCode: 404, message: 'Session not found' };

        const previousSession = await Session.findOne({ 
            userId, 
            subject: session.subject,
            createdAt: { $lt: session.createdAt }
        }).sort({ createdAt: -1 });

        let carriedCount = 0;
        if (previousSession && previousSession.tasks && previousSession.tasks.length > 0) {
            const unfinishedTasks = previousSession.tasks.filter(t => !t.completed);
            
            for (const oldTask of unfinishedTasks) {
                const exists = session.tasks.some(t => t.title.toLowerCase() === oldTask.title.toLowerCase());
                if (!exists) {
                    session.tasks.push({ title: oldTask.title });
                    carriedCount++;
                }
            }
            if (carriedCount > 0) {
                await session.save();
            }
            return { session, carriedCount };
        }
        
        return { session, carriedCount: 0 };
    }
}

export default SessionService;
