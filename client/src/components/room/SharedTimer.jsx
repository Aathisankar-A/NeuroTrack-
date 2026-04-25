import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Card, Button } from '../ui';

const SharedTimer = ({ timerState, onStart, onPause }) => {
    const [timeLeft, setTimeLeft] = useState(timerState?.duration * 60 || 25 * 60);

    useEffect(() => {
        if (!timerState) return;

        if (timerState.status === 'running' && timerState.startedAt) {
            const passed = Math.floor((Date.now() - new Date(timerState.startedAt).getTime()) / 1000);
            const remaining = (timerState.duration * 60) - passed;
            setTimeLeft(remaining > 0 ? remaining : 0);
        } else {
            setTimeLeft(timerState.duration * 60);
        }
    }, [timerState]);

    useEffect(() => {
        let interval;
        if (timerState?.status === 'running' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerState?.status, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <Card className="flex flex-col items-center justify-center p-4 text-center relative overflow-hidden bg-white dark:bg-[#121212] border-primary-100 dark:border-[#2A2A2A]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-indigo-500 opacity-20"></div>
            
            <div className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 text-xs font-bold tracking-wide uppercase">
                    <Clock size={14} />
                    Shared Timer
                </div>
                {timerState?.status === 'running' && (
                    <div className="flex items-center gap-1.5 text-green-500 text-xs font-bold animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white tabular-nums leading-none">
                    {formatTime(timeLeft)}
                </div>
                
                <div className="flex gap-2">
                    {timerState?.status === 'running' ? (
                        <Button onClick={onPause} className="rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-md shadow-primary-500/20">
                            <Pause size={18} fill="currentColor" />
                        </Button>
                    ) : (
                        <Button onClick={() => onStart(25)} className="rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-md shadow-primary-500/20">
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default SharedTimer;
