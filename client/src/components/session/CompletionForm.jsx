import React, { useState } from 'react';
import { Button } from '../ui';
import { Zap, Battery, AlertCircle } from 'lucide-react';

const CompletionForm = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        focusRating: 7,
        energyLevel: 7,
        distractionCount: 0,
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: Number(value) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-2xl border border-primary-100 dark:border-primary-900/30 mb-6">
                <p className="text-sm text-primary-700 dark:text-primary-400 font-medium">
                    Great job finishing your session! Please rate your performance to update your analytics.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center" htmlFor="focusRating">
                        <Zap size={14} className="mr-1.5 text-yellow-500" /> Focus (1-10)
                    </label>
                    <select id="focusRating" className="input" value={formData.focusRating} onChange={handleChange}>
                        {[...Array(10)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center" htmlFor="energyLevel">
                        <Battery size={14} className="mr-1.5 text-green-500" /> Energy (1-10)
                    </label>
                    <select id="energyLevel" className="input" value={formData.energyLevel} onChange={handleChange}>
                        {[...Array(10)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center" htmlFor="distractionCount">
                    <AlertCircle size={14} className="mr-1.5 text-red-400" /> Distractions
                </label>
                <input
                    id="distractionCount"
                    type="number"
                    min="0"
                    placeholder="Count of distractions"
                    className="input"
                    value={formData.distractionCount}
                    onChange={handleChange}
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 shadow-lg shadow-primary-200">
                {loading ? 'Finalizing...' : 'Complete & Save Stats'}
            </Button>
        </form>
    );
};

export default CompletionForm;
