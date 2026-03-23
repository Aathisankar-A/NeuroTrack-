import { useState, useCallback } from 'react';
import api from '../api/axios';

/**
 * Hook for managing task CRUD operations and state.
 */
const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams(params).toString();
            const res = await api.get(`/tasks${query ? `?${query}` : ''}`);
            setTasks(res.data.data || []);
            return res.data.data || [];
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch tasks');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createTask = useCallback(async (formData) => {
        const res = await api.post('/tasks', formData);
        const newTask = res.data.data;
        setTasks(prev => [newTask, ...prev]);
        return newTask;
    }, []);

    const toggleTask = useCallback(async (id) => {
        const res = await api.patch(`/tasks/${id}/toggle`);
        const updated = res.data.data;
        setTasks(prev => prev.map(t => t._id === id ? { ...t, ...updated } : t));
        return updated;
    }, []);

    const deleteTask = useCallback(async (id) => {
        await api.delete(`/tasks/${id}`);
        setTasks(prev => prev.filter(t => t._id !== id));
    }, []);

    return {
        tasks,
        loading,
        error,
        fetchTasks,
        createTask,
        toggleTask,
        deleteTask,
        setTasks,
    };
};

export default useTasks;
