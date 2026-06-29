import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import {
    Clock,
    CheckCircle2,
    Calendar as CalendarIcon,
    AlertTriangle,
    Brain,
    TrendingUp,
    Sparkles,
    Users,
    ChevronRight,
    Search,
    Bell,
    CheckSquare,
    Play,
    Pause,
    Square,
    Plus,
    Zap,
    Compass,
    CheckSquare as CheckedIcon
} from 'lucide-react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
    FocusTrendChart,
    DeepWorkTrend,
    DistractionAnalysis,
    WeeklyProductivityOverview
} from '../components/charts/DashboardCharts';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Data State
    const [stats, setStats] = useState({ focusMinutes: 0, taskCompletion: 0, burnoutRisk: 'Low' });
    const [goals, setGoals] = useState({ dailyFocusGoal: 120 });
    const [trendData, setTrendData] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [aiInsights, setAiInsights] = useState(null);
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Active session live timer state
    const [activeTimer, setActiveTimer] = useState(0);

    const todayStr = new Date().toISOString().split('T')[0];

    const fetchDashboardData = async () => {
        try {
            const [
                scoreRes,
                burnoutRes,
                trendRes,
                settingsRes,
                sessionsRes,
                roomsRes,
                tasksRes,
                insightsRes,
                overviewRes
            ] = await Promise.allSettled([
                api.get('/analytics/daily'),
                api.get('/analytics/burnout'),
                api.get('/analytics/weekly'),
                api.get('/settings'),
                api.get(`/sessions?date=${todayStr}`),
                api.get('/rooms'),
                api.get('/tasks'),
                api.get('/ai/insights'),
                api.get('/analytics/overview')
            ]);

            // Safely assign resolved responses
            const dailyData = scoreRes.status === 'fulfilled' ? scoreRes.value.data.data : null;
            const burnoutData = burnoutRes.status === 'fulfilled' ? burnoutRes.value.data.data : null;
            const trendList = trendRes.status === 'fulfilled' ? trendRes.value.data.data : [];
            const settingsData = settingsRes.status === 'fulfilled' ? settingsRes.value.data.data : null;
            const sessionsList = sessionsRes.status === 'fulfilled' ? sessionsRes.value.data.data : [];
            const roomsList = roomsRes.status === 'fulfilled' ? roomsRes.value.data.data : [];
            const tasksList = tasksRes.status === 'fulfilled' ? tasksRes.value.data.data : [];
            const insightsData = insightsRes.status === 'fulfilled' ? insightsRes.value.data.data : null;
            const overviewData = overviewRes.status === 'fulfilled' ? overviewRes.value.data.data : null;

            setStats({
                focusMinutes: dailyData?.deepFocusMinutes || overviewData?.todayFocusMinutes || 0,
                taskCompletion: dailyData ? (dailyData.taskCompletionRate * 100) : (overviewData ? overviewData.taskCompletionRate : 0),
                burnoutRisk: burnoutData?.riskLevel || 'Low'
            });

            setGoals({
                dailyFocusGoal: settingsData?.dailyFocusGoal || 120
            });

            setTrendData(trendList || []);
            
            // Sort sessions by startTime
            const sortedSessions = (sessionsList || []).sort((a, b) => a.startTime.localeCompare(b.startTime));
            setSessions(sortedSessions);
            
            setRooms(roomsList || []);
            setTasks(tasksList || []);
            setAiInsights(insightsData);
            setOverview(overviewData);
            setError(false);
        } catch (err) {
            console.error('Failed to fetch dashboard stats', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [todayStr]);

    // Active Running Session check
    const activeSession = sessions.find(s => s.status === 'active' || s.status === 'running' || s.status === 'paused');

    // Timer effect for Active Session Card
    useEffect(() => {
        let interval;
        if (activeSession && (activeSession.status === 'active' || activeSession.status === 'running')) {
            const start = new Date(activeSession.actualStartTime).getTime();
            const elapsedSeconds = Math.floor((new Date().getTime() - start) / 1000);
            const totalSec = (activeSession.plannedDuration || activeSession.duration) * 60;
            const remaining = Math.max(0, totalSec - elapsedSeconds - activeSession.pausedTime);
            setActiveTimer(remaining);

            interval = setInterval(() => {
                setActiveTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        handleStop(activeSession._id);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (activeSession && activeSession.status === 'paused') {
            const totalSec = (activeSession.plannedDuration || activeSession.duration) * 60;
            setActiveTimer(totalSec - activeSession.pausedTime);
        }
        return () => clearInterval(interval);
    }, [activeSession]);

    // Action Handlers
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
        navigate('/sessions');
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTimer = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Derived values
    const deepWorkHoursFormatted = () => {
        const hr = Math.floor(stats.focusMinutes / 60);
        const min = stats.focusMinutes % 60;
        return `${hr}h ${min}m`;
    };

    // Calculate dynamic Focus Stability Score from session ratings
    const calculateFocusStability = () => {
        const completedSessions = sessions.filter(s => s.status === 'completed' && s.focusRating);
        if (completedSessions.length === 0) return 80; // Baseline
        const totalRating = completedSessions.reduce((sum, s) => sum + s.focusRating, 0);
        return Math.round((totalRating / completedSessions.length) * 10);
    };

    const focusStability = calculateFocusStability();

    // Map Burnout Risk to Cognitive State
    const getCognitiveState = () => {
        switch (stats.burnoutRisk?.toLowerCase()) {
            case 'high':
                return {
                    status: 'Fatigued',
                    desc: 'Take a break immediately!',
                    color: 'text-red-500 bg-red-500/10'
                };
            case 'medium':
                return {
                    status: 'Moderately Stable',
                    desc: 'Pace yourself for the next session.',
                    color: 'text-yellow-500 bg-yellow-500/10'
                };
            case 'low':
            default:
                return {
                    status: 'Focused & Productive',
                    desc: "You're in your optimal zone!",
                    color: 'text-green-500 bg-green-500/10'
                };
        }
    };

    const cogState = getCognitiveState();

    // Upcoming Study Rooms
    const upcomingRooms = rooms.slice(0, 2);

    // AI Insight list directly from API
    const insightsList = aiInsights?.insights?.length > 0 ? aiInsights.insights : [];

    // Chart Formatters
    const mapWeeklyTrendForCharts = () => {
        if (trendData.length === 0) return [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return trendData.map(d => {
            const dateObj = new Date(d.date);
            return {
                day: days[dateObj.getDay()],
                score: d.score || 0,
                hours: parseFloat((d.deepFocusMinutes / 60).toFixed(1))
            };
        });
    };

    const chartTrend = mapWeeklyTrendForCharts();

    // Dynamically calculate distraction contributions based on real session logs
    const getDistractionData = () => {
        const subjectDistractions = {};
        let totalDistractions = 0;
        sessions.forEach(s => {
            if (s.distractionCount > 0) {
                subjectDistractions[s.subject] = (subjectDistractions[s.subject] || 0) + s.distractionCount;
                totalDistractions += s.distractionCount;
            }
        });

        if (totalDistractions === 0) return [];

        const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#3B82F6', '#10B981'];
        return Object.keys(subjectDistractions).map((sub, idx) => ({
            label: sub,
            value: Math.round((subjectDistractions[sub] / totalDistractions) * 100),
            color: colors[idx % colors.length]
        }));
    };

    const distractionChartData = getDistractionData();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        Good Evening, {user?.name || 'Aathi'} <span className="animate-bounce">👋</span>
                    </h1>
                    <p className="text-gray-500 dark:text-[#9CA3AF] mt-1 font-medium text-sm">
                        Let's make today a focused and meaningful one.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => navigate('/sessions')} className="rounded-xl flex items-center gap-2">
                        <CalendarIcon size={16} />
                        <span>{formatDate(todayStr)}</span>
                    </Button>
                </div>
            </div>

            {/* Row 1: Key Productivity Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Metric 1 */}
                <Card className="flex items-center justify-between p-6 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl shadow-sm">
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest">Deep Work Hours</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2 font-sans tracking-tight">{deepWorkHoursFormatted()}</h3>
                        <p className="text-xs text-green-500 font-bold mt-1">
                            ↑ {stats.focusMinutes > 0 ? '12%' : '0%'} from yesterday
                        </p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <Clock size={22} />
                    </div>
                </Card>

                {/* Metric 2 */}
                <Card className="flex items-center justify-between p-6 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl shadow-sm">
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest">Session Completion</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2 font-sans tracking-tight">
                            {Math.round(stats.taskCompletion)}%
                        </h3>
                        <p className="text-xs text-green-500 font-bold mt-1">
                            ↑ {stats.taskCompletion > 0 ? '8%' : '0%'} from yesterday
                        </p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <CheckCircle2 size={22} />
                    </div>
                </Card>

                {/* Metric 3 */}
                <Card className="flex items-center justify-between p-6 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl shadow-sm">
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest">Focus Stability</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2 font-sans tracking-tight">{focusStability}%</h3>
                        <p className="text-xs text-green-500 font-bold mt-1">
                            ↑ 5% from yesterday
                        </p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <TrendingUp size={22} />
                    </div>
                </Card>

                {/* Metric 4 */}
                <Card className="flex items-center justify-between p-6 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl shadow-sm">
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest">Cognitive State</p>
                        <h3 className={`text-lg font-extrabold mt-3 font-sans truncate`}>
                            {cogState.status}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-1">
                            {cogState.desc}
                        </p>
                    </div>
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${cogState.color}`}>
                        <Brain size={22} />
                    </div>
                </Card>
            </div>

            {/* Main Area: Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side (65%) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Session & Today's Plan side-by-side inside left */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* Today's Study Plan (Timeline) */}
                        <div className="md:col-span-7 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest">Today's Study Plan</h3>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/sessions')} className="text-xs font-bold text-purple-600 dark:text-purple-400 p-0 hover:bg-transparent">
                                    View Calendar
                                </Button>
                            </div>

                            {sessions.length === 0 ? (
                                <div className="p-8 text-center bg-gray-50 dark:bg-[#1E1E1E]/50 border border-dashed border-gray-200 dark:border-[#2A2A2A] rounded-2xl">
                                    <p className="text-gray-400 text-sm font-medium">No sessions scheduled today.</p>
                                    <Button variant="outline" size="sm" className="mt-3 mx-auto" onClick={() => navigate('/sessions')}>
                                        Schedule Session
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-[#2A2A2A]">
                                    {sessions.map((s) => {
                                        const isRunning = s.status === 'active' || s.status === 'running';
                                        const isCompleted = ['completed', 'stopped early', 'abandoned'].includes(s.status);
                                        const isPaused = s.status === 'paused';
                                        
                                        return (
                                            <div key={s._id} className="relative group">
                                                {/* Timeline Node Icon */}
                                                <span className={`absolute -left-[22px] top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-white dark:bg-[#1E1E1E] transition-all duration-300 ${
                                                    isRunning ? 'border-purple-500 scale-125 shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 
                                                    isCompleted ? 'border-green-500 bg-green-500' : 
                                                    isPaused ? 'border-yellow-500' :
                                                    'border-gray-300 dark:border-gray-700'
                                                }`} />

                                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1E1E1E]/40 hover:bg-gray-100 dark:hover:bg-[#1E1E1E]/80 border border-gray-100 dark:border-[#2A2A2A]/40 rounded-xl transition-all duration-200">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{s.startTime}</span>
                                                            <Badge variant={s.status === 'completed' ? 'success' : isRunning ? 'primary' : s.status === 'stopped early' ? 'warning' : s.status === 'abandoned' ? 'error' : 'default'}>
                                                                {s.status}
                                                            </Badge>
                                                        </div>
                                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{s.subject}</h4>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                                            {isCompleted ? `${s.actualDuration ?? 0}m studied / ` : ''}
                                                            {s.plannedDuration || s.duration}m planned
                                                        </p>
                                                    </div>

                                                    {/* Action or Progress Indicator */}
                                                    <div>
                                                        {s.status === 'scheduled' && (
                                                            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" onClick={() => handleStart(s._id)}>
                                                                Start
                                                            </Button>
                                                        )}
                                                        {isCompleted && (
                                                            <span className="text-xs font-bold text-green-500">{s.completionPercentage ?? 100}%</span>
                                                        )}
                                                        {isRunning && (
                                                            <span className="text-xs font-bold text-purple-500 animate-pulse">Live</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Active Session Card (Side-by-side with timeline) */}
                        <div className="md:col-span-5 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest">Active Session</h3>
                            
                            {activeSession ? (
                                <Card className="p-5 bg-gradient-to-br from-[#1E1E1E] to-[#161616] border border-purple-500/20 dark:border-[#2A2A2A] rounded-2xl relative overflow-hidden">
                                    {/* Glowing Accent */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-purple-400 tracking-wider uppercase">Active Session</span>
                                        <Badge variant="success" className="animate-pulse">Live</Badge>
                                    </div>

                                    <h4 className="text-xl font-extrabold text-white">{activeSession.subject}</h4>
                                    <p className="text-xs text-gray-400 mt-1">Deep Work Block</p>

                                    <div className="my-6">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Time Remaining</p>
                                        <div className="text-4xl font-black text-white font-mono tracking-tight">
                                            {formatTimer(activeTimer)}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {activeSession.status === 'running' ? (
                                            <Button size="sm" variant="warning" className="flex-1 text-xs" onClick={() => handlePause(activeSession._id)}>
                                                <Pause size={14} className="mr-1" /> Pause
                                            </Button>
                                        ) : (
                                            <Button size="sm" className="flex-1 text-xs" onClick={() => handleResume(activeSession._id)}>
                                                <Play size={14} className="mr-1" /> Resume
                                            </Button>
                                        )}
                                        <Button size="sm" variant="error" className="text-xs px-3" onClick={() => handleStop(activeSession._id)}>
                                            <Square size={14} />
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="p-6 text-center bg-gray-50 dark:bg-[#1E1E1E]/30 border border-gray-100 dark:border-[#2A2A2A] rounded-2xl h-[240px] flex flex-col justify-center items-center">
                                    <Clock className="text-gray-300 dark:text-gray-600 mb-3" size={32} />
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No session active</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[180px] mt-1">
                                        Select start on a scheduled session to begin tracking.
                                    </p>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Linked Tasks */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest">Linked Tasks</h3>
                        
                        {tasks.filter(t => !t.completed).length === 0 ? (
                            <div className="p-6 text-center bg-gray-50 dark:bg-[#1E1E1E]/40 border border-dashed border-gray-100 dark:border-[#2A2A2A] rounded-2xl">
                                <p className="text-xs text-gray-400 font-bold">All caught up! No pending tasks linked.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tasks.filter(t => !t.completed).slice(0, 4).map(task => (
                                    <div key={task._id} className="flex items-center gap-3 p-3 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-xl hover:border-purple-500/30 transition-all duration-200">
                                        <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{task.title}</p>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-semibold mt-0.5">{task.subject}</p>
                                        </div>
                                        <Badge variant={task.difficulty === 'hard' ? 'error' : task.difficulty === 'medium' ? 'warning' : 'default'}>
                                            {task.difficulty}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side (35%) */}
                <div className="space-y-8">
                    {/* AI Insights Card */}
                    <Card className="p-6 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 text-purple-600 dark:text-purple-400">
                            <Sparkles size={18} />
                            <h3 className="text-sm font-bold uppercase tracking-widest">AI Insights</h3>
                        </div>

                        <div className="space-y-4">
                            {insightsList.length > 0 ? (
                                insightsList.map((ins, idx) => (
                                    <div key={idx} className="flex gap-3 items-start">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">{ins.title}</h4>
                                            <p className="text-xs text-gray-400 dark:text-[#9CA3AF] mt-0.5">{ins.description}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-xs text-gray-400 dark:text-[#9CA3AF] italic">
                                    Your AI coach is compiling your habits. Complete a few study sessions to receive personalized insights!
                                </div>
                            )}
                        </div>

                        <Button variant="ghost" size="sm" onClick={() => navigate('/ai-insights')} className="mt-5 w-full text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10">
                            View all insights →
                        </Button>
                    </Card>

                    {/* Upcoming Collaborative Sessions (Rooms) */}
                    <Card className="p-6 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest">Upcoming Study Rooms</h3>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/rooms')} className="text-xs font-bold text-purple-600 dark:text-purple-400 p-0 hover:bg-transparent">
                                View All
                            </Button>
                        </div>

                        {upcomingRooms.length === 0 ? (
                            <p className="text-xs text-gray-400 dark:text-gray-500 italic py-4 text-center">No public rooms active.</p>
                        ) : (
                            <div className="space-y-4">
                                {upcomingRooms.map(room => (
                                    <div key={room._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1E1E1E]/40 border border-gray-100 dark:border-[#2A2A2A]/40 rounded-xl hover:border-purple-500/20 transition-all duration-200 cursor-pointer" onClick={() => navigate(`/rooms/${room._id}`)}>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{room.name}</h4>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 uppercase tracking-wider">{room.mode}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Users size={12} />
                                            <span className="text-[10px] font-bold">{room.participants?.length || 1} / {room.maxParticipants}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Tasks Overview Card */}
                    <Card className="p-6 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl">
                        <h3 className="text-sm font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest mb-4">Tasks Overview</h3>
                        
                        <div className="flex items-center justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">Completed ({tasks.filter(t => t.completed).length})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">Pending ({tasks.filter(t => !t.completed).length})</span>
                                </div>
                            </div>

                            {/* Circle Percentage SVG */}
                            <div className="relative h-20 w-20">
                                <svg viewBox="0 0 36 36" className="h-full w-full transform -rotate-90">
                                    <circle cx="18" cy="18" r="15.915" fill="none" className="stroke-gray-100 dark:stroke-[#2A2A2A]" strokeWidth="3.5" />
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="15.915"
                                        fill="none"
                                        stroke="#8B5CF6"
                                        strokeWidth="3.5"
                                        strokeDasharray={`${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0} 100`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{tasks.length}</span>
                                    <span className="text-[8px] uppercase tracking-wider text-gray-400 font-bold">Total</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#1E1E1E]">
                <div className="flex items-center gap-2 mb-6">
                    <Compass size={20} className="text-purple-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Productivity Analytics</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Focus Trend */}
                    <Card className="p-6 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest">Focus Trend</h4>
                            <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">Consistency</span>
                        </div>
                        <FocusTrendChart data={chartTrend} />
                    </Card>

                    {/* Deep Work Trend */}
                    <Card className="p-6 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest">Deep Work Trend</h4>
                            <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">Hours / Day</span>
                        </div>
                        <DeepWorkTrend data={chartTrend} />
                    </Card>

                    {/* Distraction Analysis */}
                    <Card className="p-6 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest">Distraction Analysis</h4>
                            <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">Distraction Index</span>
                        </div>
                        <DistractionAnalysis data={distractionChartData} />
                    </Card>
                </div>
            </div>

            {/* Weekly Productivity Overview */}
            <Card className="p-6 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest">Weekly Productivity Overview</h4>
                        <p className="text-sm font-extrabold text-gray-800 dark:text-gray-200 mt-1">Cumulative weekly study blocks and stability progression</p>
                    </div>

                    <div className="flex gap-6">
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Focus Time</span>
                            <span className="text-lg font-black text-gray-900 dark:text-white mt-1 block">
                                {Math.floor((overview?.weeklyFocusMinutes || stats.focusMinutes * 5) / 60)}h {(overview?.weeklyFocusMinutes || stats.focusMinutes * 5) % 60}m
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Sessions Breakdown</span>
                            <div className="flex gap-2.5 text-xs font-bold mt-1.5">
                                <span className="text-green-500" title="Fully Completed">✓ {overview?.sessionsCompleted ?? sessions.filter(s => s.status === 'completed').length}</span>
                                <span className="text-yellow-500" title="Stopped Early">⚠ {overview?.sessionsStoppedEarly ?? sessions.filter(s => s.status === 'stopped early').length}</span>
                                <span className="text-red-500" title="Abandoned">✗ {overview?.sessionsAbandoned ?? sessions.filter(s => s.status === 'abandoned').length}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Avg. Focus Score</span>
                            <span className="text-lg font-black text-gray-900 dark:text-white mt-1 block">{focusStability}%</span>
                        </div>
                    </div>
                </div>

                <WeeklyProductivityOverview data={chartTrend.map(t => t.score)} />
            </Card>
        </div>
    );
};

export default Dashboard;
