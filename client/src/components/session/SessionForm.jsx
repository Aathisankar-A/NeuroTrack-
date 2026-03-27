import React, { useState } from 'react';
import { Button } from '../ui';
import { Timer, Zap, Battery, AlertCircle, Calendar } from 'lucide-react';

const SessionForm = ({ onSubmit, loading, initialDate }) => {
    const [formData, setFormData] = useState({
        subject: '',
        date: initialDate || new Date().toISOString().split('T')[0],
        startTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        duration: 25,
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        // Only duration should be a number. Subject, date, and startTime are strings.
        setFormData(prev => ({ ...prev, [id]: id === 'duration' ? Number(value) : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1" htmlFor="subject">
                    Subject / Project Name
                </label>
                <input
                    id="subject"
                    type="text"
                    required
                    placeholder="e.g. Mathematics, Research, Coding"
                    className="input"
                    value={formData.subject}
                    onChange={handleChange}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center" htmlFor="date">
                        <Calendar size={14} className="mr-1 text-gray-400 dark:text-gray-500" /> Date
                    </label>
                    <input
                        id="date"
                        type="date"
                        required
                        className="input"
                        value={formData.date}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center" htmlFor="startTime">
                        <Timer size={14} className="mr-1 text-gray-400 dark:text-gray-500" /> Start Time
                    </label>
                    <input
                        id="startTime"
                        type="time"
                        required
                        className="input"
                        value={formData.startTime}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center" htmlFor="duration">
                    <Timer size={14} className="mr-1 text-gray-400 dark:text-gray-500" /> Duration (minutes)
                </label>
                <input
                    id="duration"
                    type="number"
                    required
                    min="1"
                    className="input"
                    value={formData.duration}
                    onChange={handleChange}
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 shadow-lg shadow-primary-200">
                {loading ? 'Scheduling...' : 'Schedule Session'}
            </Button>
        </form>
    );
};

export default SessionForm;
