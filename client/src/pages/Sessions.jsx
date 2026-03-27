import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui';
import Modal from '../components/ui/Modal';
import SessionForm from '../components/session/SessionForm';
import SessionCard from '../components/session/SessionCard';
import CompletionForm from '../components/session/CompletionForm';
import StudyPlannerWidget from '../components/ai/StudyPlannerWidget';
import { Timer, Plus, Filter, ChevronLeft, ChevronRight, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';

const Sessions = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchSessions = async (date) => {
        setLoading(true);
        try {
            const res = await api.get(`/sessions?date=${date}`);
            // Sort sessions by startTime
            const sortedSessions = res.data.data.sort((a, b) => a.startTime.localeCompare(b.startTime));
            setSessions(sortedSessions);
        } catch (err) {
            console.error('Failed to fetch sessions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions(selectedDate);
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [selectedDate]);

    const changeDate = (days) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const formatDate = (dateStr) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, options);
    };

    const handleCreateSession = async (formData) => {
        setFormLoading(true);
        try {
            await api.post('/sessions', formData);
            setIsCreateModalOpen(false);
            fetchSessions(selectedDate);
        } catch (err) {
            alert('Failed to schedule session');
        } finally {
            setFormLoading(false);
        }
    };

    const handleStart = async (id) => {
        try {
            const res = await api.patch(`/sessions/${id}/start`);
            updateSessionInList(res.data.data);
        } catch (err) {
            alert('Failed to start session');
        }
    };

    const handlePause = async (id) => {
        try {
            const res = await api.patch(`/sessions/${id}/pause`);
            updateSessionInList(res.data.data);
        } catch (err) {
            alert('Failed to pause session');
        }
    };

    const handleResume = async (id) => {
        try {
            const res = await api.patch(`/sessions/${id}/resume`);
            updateSessionInList(res.data.data);
        } catch (err) {
            alert('Failed to resume session');
        }
    };

    const handleStop = (id) => {
        setActiveSessionId(id);
        setIsCompleteModalOpen(true);
    };

    const handleComplete = async (formData) => {
        setFormLoading(true);
        try {
            const res = await api.patch(`/sessions/${activeSessionId}/complete`, formData);
            updateSessionInList(res.data.data);
            setIsCompleteModalOpen(false);
            setActiveSessionId(null);
        } catch (err) {
            alert('Failed to complete session');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this session?')) return;
        try {
            await api.delete(`/sessions/${id}`);
            setSessions(sessions.filter(s => s._id !== id));
        } catch (err) {
            alert('Failed to delete session');
        }
    };

    const updateSessionInList = (updatedSession) => {
        if (updatedSession.date === selectedDate) {
            setSessions(prev => prev.map(s => s._id === updatedSession._id ? updatedSession : s));
        } else {
            setSessions(prev => prev.filter(s => s._id !== updatedSession._id));
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Focus Timetable</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your deep work sessions day by day.</p>
                </div>
                <div className="flex space-x-3">
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={18} className="mr-2" /> New Session
                    </Button>
                </div>
            </div>

            {/* AI Planner Toggle */}
            <div className="bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/20 overflow-hidden transition-all duration-300">
                <button 
                    onClick={() => setIsPlannerOpen(!isPlannerOpen)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-primary-100/50 dark:hover:bg-primary-900/30 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-100 dark:bg-primary-900/40 p-2 rounded-xl text-primary-600 dark:text-primary-400">
                            <Sparkles size={20} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-primary-900 dark:text-primary-100">AI Study Planner</h3>
                            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Generate optimized learning timelines automatically</p>
                        </div>
                    </div>
                    {isPlannerOpen ? (
                        <ChevronUp size={24} className="text-primary-600 dark:text-primary-400" />
                    ) : (
                        <ChevronDown size={24} className="text-primary-600 dark:text-primary-400" />
                    )}
                </button>
                
                {isPlannerOpen && (
                    <div className="p-6 border-t border-primary-100 dark:border-primary-900/20">
                        <StudyPlannerWidget onSessionCreated={(session) => {
                            updateSessionInList(session);
                            setIsPlannerOpen(false);
                        }} />
                    </div>
                )}
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-center bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => changeDate(-1)}
                    className="hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors dark:text-gray-400"
                >
                    <ChevronLeft size={24} />
                </Button>

                <div className="mx-8 text-center min-w-[200px]">
                    <div className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-1">
                        {selectedDate === new Date().toISOString().split('T')[0] ? 'TODAY' : 'DATE'}
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatDate(selectedDate)}
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => changeDate(1)}
                    className="hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors dark:text-gray-400"
                >
                    <ChevronRight size={24} />
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <p className="text-gray-400 dark:text-gray-500 font-medium animate-pulse">Loading sessions for today...</p>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <div className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4"><Timer size={48} /></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No focus sessions scheduled</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto mb-6">You don't have any deep work sessions planned for this day.</p>
                        <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">
                            <Plus size={18} className="mr-2" /> Create Session
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session, index) => (
                            <SessionCard
                                key={session._id}
                                session={session}
                                previousSession={index > 0 ? sessions[index - 1] : null}
                                showFullDate={false}
                                onStart={handleStart}
                                onPause={handlePause}
                                onResume={handleResume}
                                onStop={handleStop}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Session Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Schedule Focus Session"
            >
                <SessionForm
                    onSubmit={handleCreateSession}
                    loading={formLoading}
                    initialDate={selectedDate}
                />
            </Modal>

            {/* Complete Session Modal */}
            <Modal
                isOpen={isCompleteModalOpen}
                onClose={() => {
                    setIsCompleteModalOpen(false);
                    setActiveSessionId(null);
                }}
                title="Session Recovery & Results"
            >
                <CompletionForm onSubmit={handleComplete} loading={formLoading} />
            </Modal>
        </div>
    );
};

export default Sessions;
