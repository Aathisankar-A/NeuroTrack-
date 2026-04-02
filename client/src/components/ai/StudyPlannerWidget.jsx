import React, { useState } from 'react';
import { Card, Button } from '../ui';
import { Sparkles, Loader2, AlertCircle, Clock, Check, Edit3, Plus, X } from 'lucide-react';
import { generatePlan } from '../../api/ai.api';
import api from '../../api/axios';

const StudyPlannerWidget = ({ onSessionCreated }) => {
    const [step, setStep] = useState('input'); // input, loading, edit
    const [goal, setGoal] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(60);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!goal) return;

        setStep('loading');
        setError('');

        try {
            const { data } = await generatePlan({ goal, durationMinutes });
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                setTasks(data.data);
                setStep('edit');
            } else if (data.success && data.data && !Array.isArray(data.data) && data.data.error) {
                setError('Failed to generate study plan. Please try another goal.');
                setStep('input');
            } else {
                setError('Failed to generate study plan. Please try another goal.');
                setStep('input');
            }
        } catch (err) {
            console.error('AI Plan Error:', err);
            setError('An error occurred during generation.');
            setStep('input');
        }
    };

    const handleTaskChange = (index, field, value) => {
        const updated = [...tasks];
        updated[index][field] = value;
        setTasks(updated);
    };

    const handleRemoveTask = (index) => {
        const updated = [...tasks];
        updated.splice(index, 1);
        setTasks(updated);
    };

    const handleAddTask = () => {
        setTasks([...tasks, { subject: 'Custom Task', description: '', duration: 10 }]);
    };

    const handleConfirm = async () => {
        setStep('loading');
        try {
            const totalDuration = tasks.reduce((acc, t) => acc + (Number(t.duration) || 0), 0);
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            const sessionData = {
                subject: `AI Plan: ${goal}`,
                date: dateStr,
                startTime: timeStr,
                duration: totalDuration || durationMinutes,
                tasks: tasks.map(t => ({
                    title: `[${t.duration}m] ${t.subject}${t.description ? ' - ' + t.description : ''}`
                }))
            };

            const res = await api.post('/sessions', sessionData);
            if (res.data.success) {
                onSessionCreated(res.data.data);
                // Reset
                setStep('input');
                setGoal('');
                setTasks([]);
            }
        } catch (err) {
            console.error('Failed to create session:', err);
            alert('Failed to schedule the AI session due to a conflict or issue.');
            setStep('edit');
        }
    };

    return (
        <Card className="p-6 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/10 dark:to-gray-900 border border-primary-100 dark:border-primary-900/30 shadow-sm relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold mb-4">
                    <Sparkles size={18} />
                    <span>Plan with AI</span>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {step === 'input' && (
                    <form onSubmit={handleGenerate} className="space-y-4 flex flex-col md:flex-row md:items-end gap-4">
                        <div className="flex-1 space-y-1">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Learning Goal</label>
                            <input 
                                type="text" 
                                required
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="e.g., Master React Hooks, Read Chapter 5"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="w-32 space-y-1 shrink-0">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Minutes</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="number" 
                                    required
                                    min="15"
                                    max="300"
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="md:w-auto w-full py-2.5 flex items-center gap-2 h-[46px] shrink-0">
                            Generate
                        </Button>
                    </form>
                )}

                {step === 'loading' && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Loader2 size={32} className="text-primary-500 animate-spin mb-3" />
                        <h4 className="font-bold text-gray-900 dark:text-white">Structuring your roadmap...</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI is calculating optimal focus blocks.</p>
                    </div>
                )}

                {step === 'edit' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Edit3 size={16} className="text-primary-500" />
                                Review & Edit Plan
                            </h4>
                            <div className="text-sm font-bold font-mono bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full">
                                {tasks.reduce((a, t) => a + (Number(t.duration) || 0), 0)} min total
                            </div>
                        </div>

                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {tasks.map((task, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-white dark:bg-[#121212] p-3 rounded-xl border border-gray-100 dark:border-gray-800 group">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text"
                                                value={task.subject || ''}
                                                onChange={(e) => handleTaskChange(idx, 'subject', e.target.value)}
                                                placeholder="Subject"
                                                className="font-bold text-sm bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded px-2 py-1 w-1/3 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500"
                                            />
                                            <input 
                                                type="text"
                                                value={task.description || ''}
                                                onChange={(e) => handleTaskChange(idx, 'description', e.target.value)}
                                                placeholder="Task description"
                                                className="text-sm bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 rounded px-2 py-1 flex-1 text-gray-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-16 shrink-0 flex flex-col items-center gap-2">
                                        <input 
                                            type="number"
                                            value={task.duration || 0}
                                            onChange={(e) => handleTaskChange(idx, 'duration', e.target.value)}
                                            className="w-full text-center text-sm font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30 rounded py-1 outline-none"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveTask(idx)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Remove block"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button 
                                type="button" 
                                onClick={handleAddTask}
                                className="text-sm text-gray-500 hover:text-primary-600 font-bold flex items-center gap-1 transition-colors"
                            >
                                <Plus size={16} /> Add Block
                            </button>

                            <div className="flex gap-2">
                                <Button onClick={() => setStep('input')} variant="outline" className="px-4 py-2">
                                    Cancel
                                </Button>
                                <Button onClick={handleConfirm} className="px-6 py-2 flex items-center gap-2">
                                    <Check size={16} /> Confirm & Schedule
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default StudyPlannerWidget;
