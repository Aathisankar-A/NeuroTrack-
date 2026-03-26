import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components/ui';
import Modal from '../components/ui/Modal';
import TaskForm from '../components/task/TaskForm';
import {
    CheckSquare,
    Square,
    Plus,
    Trash2,
    Calendar,
    Clock,
    MoreVertical,
    Filter
} from 'lucide-react';
import api from '../api/axios';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data.data);
        } catch (err) {
            console.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleCreateTask = async (formData) => {
        setFormLoading(true);
        try {
            await api.post('/tasks', formData);
            setIsModalOpen(false);
            fetchTasks();
        } catch (err) {
            alert('Failed to save task');
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleComplete = async (id) => {
        try {
            const res = await api.patch(`/tasks/${id}/toggle`);
            setTasks(tasks.map(t => t._id === id ? { ...t, completed: res.data.data.completed, status: res.data.data.status } : t));
        } catch (err) {
            alert('Failed to update task');
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(tasks.filter(t => t._id !== id));
        } catch (err) {
            alert('Failed to delete task');
        }
    };

    const getDifficultyColor = (diff) => {
        switch (diff?.toLowerCase()) {
            case 'easy': return 'success';
            case 'medium': return 'primary';
            case 'hard': return 'error';
            default: return 'default';
        }
    };

    const groupedTasks = tasks.reduce((acc, task) => {
        const subject = task.subject || 'Others';
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(task);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Organize your workflow and track progress.</p>
                </div>
                <div className="flex space-x-3">
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} className="mr-2" /> New Task
                    </Button>
                </div>
            </div>

            <div className="space-y-12">
                {loading ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-gray-400 dark:text-gray-500 font-medium animate-pulse">Loading tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <div className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4"><CheckSquare size={48} /></div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Clear as crystal! No tasks yet.</p>
                    </div>
                ) : (
                    Object.entries(groupedTasks).map(([subject, subjectTasks]) => (
                        <div key={subject} className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">{subject}</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {subjectTasks.map((task) => (
                                    <Card key={task._id} className={`group transition-all duration-200 ${task.status === 'completed' ? 'opacity-60 bg-gray-50/50 dark:bg-gray-800/30' : 'hover:border-primary-200 dark:hover:border-primary-800'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => handleToggleComplete(task._id)}
                                                    className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.status === 'completed'
                                                        ? 'bg-primary-600 border-primary-600 dark:bg-primary-500 dark:border-primary-500 text-white'
                                                        : 'border-gray-200 dark:border-gray-700 text-transparent hover:border-primary-400 dark:hover:border-primary-300'
                                                        }`}
                                                >
                                                    <CheckSquare size={16} />
                                                </button>
                                                <div>
                                                    <h3 className={`text-lg font-bold text-gray-900 dark:text-white transition-all ${task.status === 'completed' ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                                                        {task.title}
                                                    </h3>
                                                    {task.notes && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 italic">{task.notes}</p>
                                                    )}
                                                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-500 font-medium">
                                                        <span className="flex items-center"><Calendar size={12} className="mr-1" /> Due {new Date(task.dueDate).toLocaleDateString()}</span>
                                                        {task.timeSpent > 0 && <span className="flex items-center text-primary-600 dark:text-primary-400 font-bold"><Clock size={12} className="mr-1" /> {task.timeSpent}m tracking</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-6">
                                                <Badge variant={getDifficultyColor(task.difficulty)}>{task.difficulty}</Badge>

                                                <div className="flex items-center space-x-2 border-l border-gray-100 dark:border-gray-800 pl-6">
                                                    <button
                                                        onClick={() => handleDeleteTask(task._id)}
                                                        className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Task"
            >
                <TaskForm onSubmit={handleCreateTask} loading={formLoading} />
            </Modal>
        </div>
    );
};

export default Tasks;
