import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge } from '../ui';
import {
    Play,
    Pause,
    Square,
    Clock,
    Calendar,
    Zap,
    Battery,
    AlertCircle,
    Bell,
    CheckSquare as CheckIcon,
    ListTodo,
    Plus
} from 'lucide-react';
import api from '../../api/axios';

const SessionCard = ({ session, onStart, onPause, onResume, onStop, onDelete, showFullDate = true, previousSession }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isNotificationSent, setIsNotificationSent] = useState(false);
    const [sessionTasks, setSessionTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(false);

    // Embedded Local Tasks
    const [localTasks, setLocalTasks] = useState(session.tasks || []);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [carryTasks, setCarryTasks] = useState([]);
    const [isCarrying, setIsCarrying] = useState(false);

    // Sync when session prop updates
    useEffect(() => {
        if (session.tasks) {
            setLocalTasks(session.tasks);
        }
    }, [session.tasks]);

    // Check carry forward
    useEffect(() => {
        const checkCarryForward = async () => {
            if (session.status === 'scheduled' && (!session.tasks || session.tasks.length === 0)) {
                try {
                    const res = await api.get(`/sessions/${session._id}/previous-unfinished-tasks`);
                    if (res.data.data && res.data.data.length > 0) {
                        setCarryTasks(res.data.data);
                    }
                } catch (err) {
                    console.error('Carry forward check failed', err);
                }
            }
        };
        checkCarryForward();
    }, [session._id, session.status, session.tasks]);

    const handleCarryForward = async () => {
        setIsCarrying(true);
        try {
            const res = await api.post(`/sessions/${session._id}/carry-forward`);
            setLocalTasks(res.data.data.session.tasks);
            setCarryTasks([]);
        } catch (err) {
            alert('Failed to carry forward tasks');
        } finally {
            setIsCarrying(false);
        }
    };

    const handleAddLocalTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            const res = await api.post(`/sessions/${session._id}/tasks`, { title: newTaskTitle });
            setLocalTasks(res.data.data.tasks);
            setNewTaskTitle('');
        } catch (err) {
            alert('Failed to add task');
        }
    };

    const toggleLocalTask = async (taskId) => {
        try {
            const res = await api.patch(`/sessions/${session._id}/tasks/${taskId}`);
            setLocalTasks(res.data.data.tasks);
        } catch (err) {
            alert('Failed to update task');
        }
    };

    const deleteLocalTask = async (taskId) => {
        try {
            const res = await api.delete(`/sessions/${session._id}/tasks/${taskId}`);
            setLocalTasks(res.data.data.tasks);
        } catch (err) {
            alert('Failed to delete task');
        }
    };

    const fetchSessionTasks = useCallback(async () => {
        if (session.status === 'running') {
            setTasksLoading(true);
            try {
                const res = await api.get(`/tasks?subject=${encodeURIComponent(session.subject)}&status=pending`);
                setSessionTasks(res.data.data);
            } catch (err) {
                console.error('Failed to fetch session tasks');
            } finally {
                setTasksLoading(false);
            }
        }
    }, [session.status, session.subject]);

    useEffect(() => {
        fetchSessionTasks();
    }, [fetchSessionTasks]);

    const handleTaskToggle = async (taskId) => {
        try {
            await api.patch(`/tasks/${taskId}/toggle`);
            setSessionTasks(prev => prev.filter(t => t._id !== taskId));
        } catch (err) {
            alert('Failed to update task');
        }
    };

    // Calculate initial time left
    useEffect(() => {
        if (session.status === 'running') {
            const start = new Date(session.actualStartTime).getTime();
            const now = new Date().getTime();
            const elapsedSeconds = Math.floor((now - start) / 1000);
            const totalDurationSeconds = session.duration * 60;
            const remaining = Math.max(0, totalDurationSeconds - elapsedSeconds - session.pausedTime);
            setTimeLeft(remaining);
        } else if (session.status === 'paused' || session.status === 'scheduled') {
            const totalDurationSeconds = session.duration * 60;
            setTimeLeft(totalDurationSeconds - session.pausedTime);
        }
    }, [session.status, session.actualStartTime, session.duration, session.pausedTime]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (session.status === 'running' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        onStop(session._id); // Auto-stop when reaches 0
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [session.status, timeLeft, onStop, session._id]);

    // Notification effect
    useEffect(() => {
        if (session.status === 'scheduled' && !isNotificationSent) {
            const checkNotification = () => {
                const sessionTime = new Date(`${session.date}T${session.startTime}`).getTime();
                const now = new Date().getTime();

                if (now >= sessionTime && now < sessionTime + 60000) { // within 1 minute
                    if (Notification.permission === 'granted') {
                        new Notification(`NeuroTrack: ${session.subject}`, {
                            body: `Your focus session for ${session.subject} is starting now!`,
                            icon: '/logo192.png'
                        });
                        setIsNotificationSent(true);
                    }
                }
            };

            const interval = setInterval(checkNotification, 10000);
            return () => clearInterval(interval);
        }
    }, [session.status, session.date, session.startTime, session.subject, isNotificationSent]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'primary';
            case 'running': return 'success';
            case 'paused': return 'warning';
            case 'completed': return 'default';
            case 'missed': return 'error';
            default: return 'default';
        }
    };

    return (
        <Card className={`overflow-hidden transition-all duration-300 ${session.status === 'running' ? 'ring-1 ring-primary-500/50 shadow-md scale-[1.01]' : 'hover:border-primary-200 dark:hover:border-[#2A2A2A]'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-5">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${session.status === 'running' ? 'bg-primary-600 text-white shadow-sm' : 'bg-primary-50 dark:bg-[#2A2A2A] text-primary-600 dark:text-primary-400'
                        }`}>
                        <Clock size={28} />
                    </div>
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{session.subject}</h3>
                            <Badge variant={getStatusColor(session.status)}>{session.status}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {showFullDate && (
                                <span className="flex items-center"><Calendar size={14} className="mr-1.5" /> {session.date}</span>
                            )}
                            <span className="flex items-center"><Clock size={14} className="mr-1.5" /> {session.startTime} ({session.duration}m)</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3">
                    {session.status === 'running' || session.status === 'paused' ? (
                        <div className="text-center md:text-right">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Remaining Time</p>
                            <span className="text-3xl font-black text-primary-600 dark:text-primary-400 font-mono tracking-tight">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    ) : session.status === 'completed' && (
                        <div className="flex items-center space-x-6">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Focus</p>
                                <Badge variant={session.focusRating >= 8 ? 'success' : 'primary'}>{session.focusRating}/10</Badge>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Energy</p>
                                <Badge variant={session.energyLevel >= 8 ? 'success' : 'warning'}>{session.energyLevel}/10</Badge>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        {session.status === 'scheduled' && (() => {
                            const now = new Date();
                            const todayStr = now.toISOString().split('T')[0];
                            const isFutureDate = session.date > todayStr;

                            let isWaitPrev = false;
                            if (previousSession && session.date === todayStr) {
                                // Previous session end time in minutes
                                const [h, m] = previousSession.startTime.split(':').map(Number);
                                const prevEndMinutes = h * 60 + m + previousSession.duration;

                                // Current time in minutes
                                const currentMinutes = now.getHours() * 60 + now.getMinutes();

                                if (currentMinutes < prevEndMinutes) {
                                    isWaitPrev = true;
                                }
                            }

                            if (isFutureDate) {
                                return (
                                    <div className="flex flex-col items-end">
                                        <Button size="sm" disabled>
                                            <Play size={16} className="mr-1.5" /> Start
                                        </Button>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-medium italic">Scheduled for future date</span>
                                    </div>
                                );
                            }

                            if (isWaitPrev) {
                                return (
                                    <div className="flex flex-col items-end">
                                        <Button size="sm" disabled>
                                            <Play size={16} className="mr-1.5" /> Start
                                        </Button>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-medium italic">Wait for previous session to end</span>
                                    </div>
                                );
                            }

                            return (
                                <Button size="sm" onClick={() => onStart(session._id)}>
                                    <Play size={16} className="mr-1.5" /> Start
                                </Button>
                            );
                        })()}
                        {session.status === 'running' && (
                            <>
                                <Button size="sm" variant="warning" onClick={() => onPause(session._id)}>
                                    <Pause size={16} className="mr-1.5" /> Pause
                                </Button>
                                <Button size="sm" variant="error" onClick={() => onStop(session._id)}>
                                    <Square size={16} className="mr-1.5" /> Stop
                                </Button>
                            </>
                        )}
                        {session.status === 'paused' && (
                            <>
                                <Button size="sm" onClick={() => onResume(session._id)}>
                                    <Play size={16} className="mr-1.5" /> Resume
                                </Button>
                                <Button size="sm" variant="error" onClick={() => onStop(session._id)}>
                                    <Square size={16} className="mr-1.5" /> Stop
                                </Button>
                            </>
                        )}
                        {session.status !== 'running' && session.status !== 'paused' && (
                            <button
                                onClick={() => onDelete(session._id)}
                                className="p-2.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            >
                                <AlertCircle size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Embedded Session Tasks */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-[#2A2A2A]">
                {/* Carry Forward Banner */}
                {carryTasks.length > 0 && session.status === 'scheduled' && (
                    <div className="mb-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 p-4 rounded-xl animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-start gap-3">
                            <Zap className="text-primary-500 mt-0.5 shrink-0" size={18} />
                            <div className="flex-1">
                                <p className="text-sm text-primary-900 dark:text-primary-100 font-bold mb-2">
                                    You have unfinished tasks from your previous {session.subject} session.
                                </p>
                                <ul className="space-y-1 mb-4">
                                    {carryTasks.slice(0, 3).map((t, i) => (
                                        <li key={i} className="text-xs text-primary-700 dark:text-primary-300 flex items-center gap-2">
                                            <Square size={10} className="shrink-0 opacity-50" /> <span className="truncate">{t.title}</span>
                                        </li>
                                    ))}
                                    {carryTasks.length > 3 && (
                                        <li className="text-xs text-primary-500 italic">...and {carryTasks.length - 3} more</li>
                                    )}
                                </ul>
                                <div className="flex gap-3">
                                    <Button size="sm" onClick={handleCarryForward} disabled={isCarrying}>
                                        {isCarrying ? 'Moving...' : 'Carry Forward'}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setCarryTasks([])} className="bg-transparent border-primary-200 text-primary-700 hover:bg-primary-100 dark:border-[#2A2A2A] dark:text-[#9CA3AF] dark:hover:bg-[#2A2A2A] dark:hover:text-[#E5E5E5]">
                                        Ignore
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-700 dark:text-gray-300 font-bold">
                        <ListTodo size={18} className="mr-2 opacity-70" />
                        <span>Session Tasks</span>
                    </div>
                    <Badge variant="default">{localTasks.filter(t=>t.completed).length}/{localTasks.length}</Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                    {[...localTasks].sort((a,b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1)).map((task) => (
                        <div key={task._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] rounded-xl group transition-all">
                            <button 
                                onClick={() => session.status !== 'completed' && toggleLocalTask(task._id)} 
                                disabled={session.status === 'completed'}
                                className={`transition-transform active:scale-90 ${session.status === 'completed' ? 'cursor-default' : 'text-gray-400 hover:text-primary-500'}`}
                            >
                                {task.completed ? <CheckIcon size={18} className={session.status === 'completed' ? 'text-gray-400 dark:text-gray-600' : 'text-primary-500'} /> : <Square size={18} className={session.status === 'completed' ? 'text-gray-300 dark:text-gray-600' : ''} />}
                            </button>
                            <span className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-400 dark:text-[#9CA3AF]' : 'text-gray-700 dark:text-[#E5E5E5]'}`}>
                                {task.title}
                            </span>
                            {session.status !== 'completed' && (
                                <button onClick={() => deleteLocalTask(task._id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all p-1">
                                    <AlertCircle size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {session.status !== 'completed' && (
                    <form onSubmit={handleAddLocalTask} className="flex relative mt-2">
                        <Plus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            value={newTaskTitle} 
                            onChange={e => setNewTaskTitle(e.target.value)} 
                            placeholder="Add a task for this session..." 
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2A2A2A] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-[#E5E5E5] transition-all"
                        />
                    </form>
                )}
            </div>

            {session.status === 'running' && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-gray-700 dark:text-gray-300 font-bold">
                            <ListTodo size={18} className="mr-2 text-primary-600 dark:text-primary-400" />
                            <span>Active Tasks for {session.subject}</span>
                        </div>
                        <Badge variant="primary">{sessionTasks.length} Pending</Badge>
                    </div>

                    {tasksLoading ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Loading related tasks...</p>
                    ) : sessionTasks.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">No pending tasks for this subject.</p>
                    ) : (
                        <div className="space-y-2">
                            {sessionTasks.map(task => (
                                <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => handleTaskToggle(task._id)}
                                            className="h-5 w-5 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all bg-white dark:bg-gray-900"
                                        >
                                            <CheckIcon size={12} className="opacity-0 group-hover:opacity-100" />
                                        </button>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{task.title}</p>
                                            {task.notes && <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{task.notes}</p>}
                                        </div>
                                    </div>
                                    <Badge variant="default" className="text-[10px] uppercase opacity-60">{task.difficulty}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

export default SessionCard;
