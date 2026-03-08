import TaskService from '../services/task.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

class TaskController {
    static create = asyncHandler(async (req, res) => {
        const task = await TaskService.createTask(req.user.id, req.body);
        res.status(201).json(ApiResponse.success(task, 'Task created successfully'));
    });

    static getAll = asyncHandler(async (req, res) => {
        const result = await TaskService.getTasks(req.user.id, req.query);
        res.json(ApiResponse.success(result.data, 'Tasks fetched', 200, result.pagination));
    });

    static update = asyncHandler(async (req, res) => {
        const task = await TaskService.updateTask(req.user.id, req.params.id, req.body);
        res.json(ApiResponse.success(task, 'Task updated successfully'));
    });

    static delete = asyncHandler(async (req, res) => {
        await TaskService.deleteTask(req.user.id, req.params.id);
        res.json(ApiResponse.success(null, 'Task deleted successfully'));
    });

    static toggleComplete = asyncHandler(async (req, res) => {
        const task = await TaskService.toggleTaskCompletion(req.user.id, req.params.id);
        res.json(ApiResponse.success(task, `Task marked as ${task.completed ? 'completed' : 'incomplete'}`));
    });
}

export default TaskController;
