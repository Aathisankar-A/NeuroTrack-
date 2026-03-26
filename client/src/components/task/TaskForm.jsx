import React, { useState } from 'react';
import { Button } from '../ui';
import { Target, Calendar, BarChart, Clock } from 'lucide-react';

const TaskForm = ({ onSubmit, loading, initialData = null }) => {
    const [formData, setFormData] = useState(initialData || {
        title: '',
        subject: '',
        difficulty: 'medium',
        notes: '',
        dueDate: new Date().toISOString().split('T')[0],
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1" htmlFor="title">
                    Task Title
                </label>
                <input
                    id="title"
                    type="text"
                    required
                    placeholder="e.g. Finish Algorithm Homework"
                    className="input"
                    value={formData.title}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1" htmlFor="subject">
                    Subject
                </label>
                <input
                    id="subject"
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    className="input"
                    value={formData.subject}
                    onChange={handleChange}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center" htmlFor="difficulty">
                        <BarChart size={14} className="mr-1 text-gray-400 dark:text-gray-500" /> Difficulty
                    </label>
                    <select id="difficulty" className="input" value={formData.difficulty} onChange={handleChange}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center" htmlFor="dueDate">
                        <Calendar size={14} className="mr-1 text-gray-400 dark:text-gray-500" /> Due Date
                    </label>
                    <input
                        id="dueDate"
                        type="date"
                        required
                        className="input"
                        value={formData.dueDate}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1" htmlFor="notes">
                    Notes (Optional)
                </label>
                <textarea
                    id="notes"
                    placeholder="Add details about this task..."
                    className="input min-h-[100px] resize-none"
                    value={formData.notes}
                    onChange={handleChange}
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 shadow-lg shadow-primary-200">
                {loading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
            </Button>
        </form>
    );
};

export default TaskForm;
