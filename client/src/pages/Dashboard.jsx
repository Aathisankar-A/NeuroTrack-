import React, { useEffect, useState } from 'react';
import { Card, Button } from '../components/ui';
import {
    Clock,
    CheckCircle2,
    Calendar as CalendarIcon,
    AlertTriangle
} from 'lucide-react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import SessionCard from '../components/session/SessionCard';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Keeping all original state maps to avoid breaking logic
    const [stats, setStats] = useState({ focusMinutes: 0, taskCompletion: 0, burnoutRisk: 'Low' });
    const [goals, setGoals] = useState({ dailyFocusGoal: 120 });
    const [trendData, setTrendData] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [history, setHistory] = useState([]);
    
    // New Feature State
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const todayStr = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetching exactly the same analytics to guarantee no breaking changes
                const [scoreRes, burnoutRes, trendRes, settingsRes, achRes, histRes, sessionsRes] = await Promise.all([
                    api.get('/analytics/daily'),
                    api.get('/analytics/burnout'),
                    api.get('/analytics/weekly'),
                    api.get('/settings'),
                    api.get('/analytics/achievements'),
                    api.get('/analytics/history'),
                    api.get(`/sessions?date=${todayStr}`)
                ]);

                setStats({
                    focusMinutes: scoreRes.data.data?.deepFocusMinutes || 0,
                    taskCompletion: (scoreRes.data.data?.taskCompletionRate || 0) * 100,
                    burnoutRisk: burnoutRes.data.data?.riskLevel || 'Low'
                });

                setGoals({
                    dailyFocusGoal: settingsRes.data.data?.dailyFocusGoal || 120
                });

                setTrendData(trendRes.data.data || []);
                setAchievements(achRes.data.data || []);
                setHistory(histRes.data.data || []);
                
                // Set and sort today's sessions natively
                const sorted = (sessionsRes.data.data || []).sort((a, b) => a.startTime.localeCompare(b.startTime));
                setSessions(sorted);
                
            } catch (err) {
                console.error('Failed to fetch dashboard stats');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [todayStr]);

    // Replicate Session Handlers locally so SessionCard functions correctly
    const updateSessionInList = (updatedSession) => {
        setSessions(prev => prev.map(s => s._id === updatedSession._id ? updatedSession : s));
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
        // Since dashboard doesn't have the completion modal mapped, redirect to Sessions app loop
        navigate('/sessions');
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

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const nextSession = sessions.find(s => s.status === 'scheduled' || s.status === 'running' || s.status === 'paused');

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Header: Today's Planner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-[#1E1E1E]">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E5E5E5] tracking-tight">Today Planner</h1>
                    <div className="flex items-center text-gray-500 dark:text-[#9CA3AF] mt-2 font-medium">
                        <CalendarIcon size={16} className="mr-2" />
                        {formatDate(todayStr)}
                    </div>
                </div>
                
                {/* Minimal Quick Stats */}
                <div className="flex gap-4">
                    <Card className="px-5 py-3 flex items-center gap-4 bg-gray-50 dark:bg-[#1E1E1E] shadow-none border-none">
                        <Clock size={20} className="text-primary-500" />
                        <div>
                            <p className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-wider">Focus Time</p>
                            <p className="text-lg font-black text-gray-900 dark:text-[#E5E5E5]">{stats.focusMinutes} <span className="text-sm font-medium text-gray-500">/ {goals.dailyFocusGoal}m</span></p>
                        </div>
                    </Card>
                    <Card className="px-5 py-3 flex items-center gap-4 bg-gray-50 dark:bg-[#1E1E1E] shadow-none border-none">
                        <CheckCircle2 size={20} className="text-green-500" />
                        <div>
                            <p className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-wider">Completion</p>
                            <p className="text-lg font-black text-gray-900 dark:text-[#E5E5E5]">{Math.round(stats.taskCompletion)}%</p>
                        </div>
                    </Card>
                </div>
            </div>

            {loading ? (
                <div className="h-40 bg-gray-50 dark:bg-[#1E1E1E] rounded-xl animate-pulse" />
            ) : (
                <div className="grid grid-cols-1 gap-10">
                    
                    {/* Next Session Hero */}
                    {nextSession && (
                        <div>
                            <h2 className="text-sm font-bold text-gray-500 dark:text-[#9CA3AF] uppercase tracking-widest mb-4 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-primary-500 mr-2 animate-pulse" />
                                Up Next
                            </h2>
                            <SessionCard
                                session={nextSession}
                                showFullDate={false}
                                onStart={handleStart}
                                onPause={handlePause}
                                onResume={handleResume}
                                onStop={handleStop}
                                onDelete={handleDelete}
                            />
                        </div>
                    )}

                    {/* Today's Schedule Map */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-[#E5E5E5]">Today's Sessions</h2>
                            <Button variant="outline" size="sm" onClick={() => navigate('/sessions')}>Manage Schedule</Button>
                        </div>
                        
                        {sessions.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 dark:bg-[#1E1E1E] rounded-xl border border-dashed border-gray-200 dark:border-[#2A2A2A]">
                                <Clock className="mx-auto text-gray-400 dark:text-[#9CA3AF] mb-3" size={32} />
                                <p className="text-gray-500 dark:text-[#9CA3AF] font-medium">Your schedule is completely clear today.</p>
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
                </div>
            )}
        </div>
    );
};

export default Dashboard;
