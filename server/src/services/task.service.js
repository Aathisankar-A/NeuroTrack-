import Task from '../models/Task.js';
import paginate from '../utils/paginate.js';
import ScoringService from './scoring.service.js';

class TaskService {
    static async createTask(userId, taskData) {
        return await Task.create({ ...taskData, userId });
    }

    static async getTasks(userId, queryOptions) {
        const filter = { userId };

        if (queryOptions.status) {
            filter.status = queryOptions.status;
        }

        if (queryOptions.completed !== undefined) {
            filter.completed = queryOptions.completed === 'true';
        }

        if (queryOptions.subject) {
            filter.subject = { $regex: queryOptions.subject, $options: 'i' };
        }

        return await paginate(Task, filter, queryOptions);
    }

    static async updateTask(userId, taskId, updateData) {
        // If status is being updated to completed, handle completion logic
        if (updateData.status === 'completed') {
            updateData.completed = true;
            updateData.completedAt = new Date();
        } else if (updateData.status === 'pending') {
            updateData.completed = false;
        }

        const task = await Task.findOneAndUpdate({ _id: taskId, userId }, updateData, {
            new: true,
            runValidators: true,
        });
        if (!task) throw { statusCode: 404, message: 'Task not found' };

        if (updateData.status === 'completed') {
            await ScoringService.calculateDailyScore(userId, new Date());
        }

        return task;
    }

    static async deleteTask(userId, taskId) {
        const result = await Task.deleteOne({ _id: taskId, userId });
        if (result.deletedCount === 0) throw { statusCode: 404, message: 'Task not found' };
        return true;
    }

    static async toggleTaskCompletion(userId, taskId) {
        const task = await Task.findOne({ _id: taskId, userId });
        if (!task) throw { statusCode: 404, message: 'Task not found' };

        task.status = task.status === 'completed' ? 'pending' : 'completed';
        task.completed = task.status === 'completed';
        task.completedAt = task.status === 'completed' ? new Date() : undefined;
        await task.save();

        // Trigger scoring recalculation for the day of completion
        if (task.status === 'completed') {
            await ScoringService.calculateDailyScore(userId, new Date());
        }

        return task;
    }
}

export default TaskService;
