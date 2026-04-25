import React, { useEffect, useState } from 'react';
import { Brain, Zap, Activity, TrendingUp } from 'lucide-react';

// Cognitive score is computed from focus consistency, task completion rate, and session quality
const CognitiveScore = ({ overviewData }) => {
    const [score, setScore] = useState(0);
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        if (!overviewData) return;

        const { taskCompletionRate = 0, sessionsCompleted = 0, weeklyFocusMinutes = 0 } = overviewData;

        // Weighted formula: Focus time (40%), Task completion (40%), Session frequency (20%)
        const focusScore = Math.min(100, (weeklyFocusMinutes / 600) * 100); // target: 600 min/week
        const taskScore = taskCompletionRate;
        const sessionScore = Math.min(100, (sessionsCompleted / 14) * 100); // target: 14 sessions/week

        const computed = Math.round((focusScore * 0.4) + (taskScore * 0.4) + (sessionScore * 0.2));
        setScore(computed);
    }, [overviewData]);

    // Animate counter
    useEffect(() => {
        if (displayScore < score) {
            const timeout = setTimeout(() => {
                setDisplayScore(prev => Math.min(prev + 2, score));
            }, 16);
            return () => clearTimeout(timeout);
        }
    }, [displayScore, score]);

    const getScoreLabel = (s) => {
        if (s >= 85) return { label: 'Elite', color: 'text-green-500', bg: 'from-green-500/20 to-green-500/5', ring: 'stroke-green-500' };
        if (s >= 70) return { label: 'High', color: 'text-primary-500', bg: 'from-primary-500/20 to-primary-500/5', ring: 'stroke-primary-500' };
        if (s >= 50) return { label: 'Moderate', color: 'text-amber-500', bg: 'from-amber-500/20 to-amber-500/5', ring: 'stroke-amber-500' };
        return { label: 'Building', color: 'text-red-400', bg: 'from-red-400/20 to-red-400/5', ring: 'stroke-red-400' };
    };

    const { label, color, bg, ring } = getScoreLabel(score);
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (displayScore / 100) * circumference;

    return (
        <div className={`relative flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-b ${bg} border border-gray-100 dark:border-[#2A2A2A] overflow-hidden`}>
            <div className="relative w-36 h-36 mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-[#2A2A2A]" />
                    <circle
                        cx="64" cy="64" r={radius} fill="none" strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`${ring} transition-all duration-100`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Brain size={20} className={`${color} mb-1`} />
                    <span className={`text-3xl font-black ${color} leading-none`}>{displayScore}</span>
                    <span className="text-xs font-bold text-gray-400 mt-0.5">/ 100</span>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cognitive Load Score</h3>
            <div className={`mt-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-black/20 border border-gray-200/50 dark:border-white/10 text-sm font-bold ${color}`}>
                {label} Performance
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 w-full text-center">
                <div>
                    <Zap size={14} className="mx-auto text-amber-500 mb-1" />
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Focus</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{Math.round(Math.min(100, ((overviewData?.weeklyFocusMinutes || 0) / 600) * 100))}%</p>
                </div>
                <div>
                    <Activity size={14} className="mx-auto text-primary-500 mb-1" />
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Tasks</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{overviewData?.taskCompletionRate || 0}%</p>
                </div>
                <div>
                    <TrendingUp size={14} className="mx-auto text-green-500 mb-1" />
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Sessions</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{overviewData?.sessionsCompleted || 0}</p>
                </div>
            </div>
        </div>
    );
};

export default CognitiveScore;
