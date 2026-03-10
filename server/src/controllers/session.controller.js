import SessionService from '../services/session.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

class SessionController {
    static create = asyncHandler(async (req, res) => {
        const session = await SessionService.createSession(req.user.id, req.body);
        res.status(201).json(ApiResponse.success(session, 'Session recorded successfully'));
    });

    static getAll = asyncHandler(async (req, res) => {
        const result = await SessionService.getSessions(req.user.id, req.query);
        res.json(ApiResponse.success(result.data, 'Sessions fetched', 200, result.pagination));
    });

    static getOne = asyncHandler(async (req, res) => {
        const session = await SessionService.getSessionById(req.user.id, req.params.id);
        res.json(ApiResponse.success(session, 'Session details fetched'));
    });

    static start = asyncHandler(async (req, res) => {
        const session = await SessionService.startSession(req.user.id, req.params.id);
        res.json(ApiResponse.success(session, 'Session started'));
    });

    static pause = asyncHandler(async (req, res) => {
        const session = await SessionService.pauseSession(req.user.id, req.params.id);
        res.json(ApiResponse.success(session, 'Session paused'));
    });

    static resume = asyncHandler(async (req, res) => {
        const session = await SessionService.resumeSession(req.user.id, req.params.id);
        res.json(ApiResponse.success(session, 'Session resumed'));
    });

    static complete = asyncHandler(async (req, res) => {
        const session = await SessionService.completeSession(req.user.id, req.params.id, req.body);
        res.json(ApiResponse.success(session, 'Session completed and analytics updated'));
    });

    static delete = asyncHandler(async (req, res) => {
        await SessionService.deleteSession(req.user.id, req.params.id);
        res.json(ApiResponse.success(null, 'Session deleted successfully'));
    });

    // --- Embedded Tasks Logic ---
    static addTask = asyncHandler(async (req, res) => {
        const session = await SessionService.addTask(req.user.id, req.params.id, req.body.title);
        res.json(ApiResponse.success(session, 'Task added to session'));
    });

    static toggleTask = asyncHandler(async (req, res) => {
        const session = await SessionService.toggleTask(req.user.id, req.params.sessionId, req.params.taskId);
        res.json(ApiResponse.success(session, 'Task status updated'));
    });

    static deleteTask = asyncHandler(async (req, res) => {
        const session = await SessionService.deleteTask(req.user.id, req.params.sessionId, req.params.taskId);
        res.json(ApiResponse.success(session, 'Task removed from session'));
    });

    static checkUnfinished = asyncHandler(async (req, res) => {
        const tasks = await SessionService.checkPreviousUnfinished(req.user.id, req.params.id);
        res.json(ApiResponse.success(tasks, 'Unfinished tasks fetched'));
    });

    static carryForward = asyncHandler(async (req, res) => {
        const result = await SessionService.carryForwardTasks(req.user.id, req.params.id);
        res.json(ApiResponse.success(result, `Carried forward ${result.carriedCount} tasks`));
    });
}

export default SessionController;
