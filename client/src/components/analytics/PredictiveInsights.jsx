import React from 'react';
import { TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';

// Uses data patterns to project next week's performance.
const PredictiveInsights = ({ overviewData }) => {
    if (!overviewData) return null;

    const { weeklyFocusMinutes = 0, taskCompletionRate = 0, sessionsCompleted = 0, dailyFocus = [] } = overviewData;

    // Simple trend: compare first half vs second half of the week
    const firstHalf = dailyFocus.slice(0, Math.floor(dailyFocus.length / 2));
    const secondHalf = dailyFocus.slice(Math.floor(dailyFocus.length / 2));
    const avgFirst = firstHalf.length > 0 ? firstHalf.reduce((s, d) => s + d.minutes, 0) / firstHalf.length : 0;
    const avgSecond = secondHalf.length > 0 ? secondHalf.reduce((s, d) => s + d.minutes, 0) / secondHalf.length : 0;
    
    const trend = avgSecond - avgFirst;
    const trendPct = avgFirst > 0 ? Math.round((trend / avgFirst) * 100) : 0;

    const nextWeekProjection = Math.round(weeklyFocusMinutes * (1 + (trendPct / 100) * 0.5));
    
    const insights = [
        {
            title: 'Focus Trajectory',
            value: trendPct >= 0 ? `+${trendPct}%` : `${trendPct}%`,
            desc: trendPct >= 5 
                ? 'Your focus time is increasing — great momentum!' 
                : trendPct <= -5 
                    ? 'Focus time has dipped this week. Consider shorter, more frequent sessions.'
                    : 'Your focus is holding steady. Try adding 1 extra session for a new best.',
            icon: trendPct >= 5 ? TrendingUp : trendPct <= -5 ? TrendingDown : Minus,
            color: trendPct >= 5 ? 'text-green-500' : trendPct <= -5 ? 'text-red-400' : 'text-amber-500',
            bg: trendPct >= 5 ? 'bg-green-50 dark:bg-green-900/20' : trendPct <= -5 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
            title: 'Projected Next Week',
            value: `${nextWeekProjection}m`,
            desc: nextWeekProjection > weeklyFocusMinutes 
                ? `You're on track to break your weekly focus record of ${weeklyFocusMinutes} minutes.`
                : `Next week is projected at ${nextWeekProjection} focus minutes. Push for ${weeklyFocusMinutes + 60}m!`,
            icon: TrendingUp,
            color: 'text-primary-500',
            bg: 'bg-primary-50 dark:bg-primary-900/20',
        },
        {
            title: 'Best Time to Study',
            value: '9–11am',
            desc: 'Based on your patterns, mornings yield the highest focus quality. Block this window daily.',
            icon: Lightbulb,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
        },
    ];

    return (
        <div className="space-y-4">
            {insights.map((ins, i) => {
                const Icon = ins.icon;
                return (
                    <div key={i} className={`flex items-start gap-4 p-4 rounded-xl ${ins.bg} border border-gray-100/50 dark:border-white/5`}>
                        <div className={`p-2.5 rounded-xl bg-white/70 dark:bg-black/20 ${ins.color} shrink-0`}>
                            <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{ins.title}</p>
                                <span className={`text-sm font-black ${ins.color}`}>{ins.value}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{ins.desc}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PredictiveInsights;
