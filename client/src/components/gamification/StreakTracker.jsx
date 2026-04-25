import React from 'react';
import { Card } from '../ui';
import { Flame, Check } from 'lucide-react';

const StreakTracker = () => {
    const currentStreak = 7; // Mock data

    // Generate last 7 days including today
    const days = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            completed: i < 7, // Mock all completed for 7-day streak
            isToday: i === 6
        };
    });

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-xl">
                        <Flame size={24} className={currentStreak > 0 ? "fill-orange-500 text-orange-500" : ""} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            {currentStreak} Day Streak!
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">You're on fire! Keep it up.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center px-2">
                {days.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${day.completed ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-gray-100 text-gray-400 dark:bg-[#1E1E1E] dark:text-gray-600'} ${day.isToday && !day.completed ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-[#121212]' : ''}`}>
                            {day.completed ? <Check size={14} strokeWidth={3} /> : ''}
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${day.isToday ? 'text-orange-500' : 'text-gray-400'}`}>
                            {day.name}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default StreakTracker;
