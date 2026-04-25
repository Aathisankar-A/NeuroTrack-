import React from 'react';
import { Card } from '../ui';
import { Flame, Zap, CheckCircle2, Trophy, Lock } from 'lucide-react';

const AchievementBadges = () => {
    // Mock user badges
    const earnedBadges = ['STREAK_7', 'TASKS_50'];

    const ALL_BADGES = [
        { id: 'STREAK_7', title: '7-Day Warrior', desc: 'Maintained a 7-day streak', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', ring: 'ring-orange-500' },
        { id: 'FOCUS_1000', title: 'Deep Diver', desc: 'Reached 1,000 focus minutes', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', ring: 'ring-blue-500' },
        { id: 'TASKS_50', title: 'Task Crusher', desc: 'Completed 50 tasks', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', ring: 'ring-green-500' },
        { id: 'LEVEL_10', title: 'Focus Master', desc: 'Reached Level 10', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', ring: 'ring-yellow-500' },
    ];

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Achievement Badges</h3>
            <div className="grid grid-cols-2 gap-4">
                {ALL_BADGES.map(badge => {
                    const isEarned = earnedBadges.includes(badge.id);
                    const Icon = badge.icon;
                    return (
                        <div key={badge.id} className={`relative flex flex-col items-center text-center p-4 rounded-xl border transition-all ${isEarned ? `bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-[#2A2A2A] hover:shadow-md hover:ring-2 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-[#121212] hover:${badge.ring}` : 'bg-gray-50 dark:bg-[#121212] border-dashed border-gray-200 dark:border-[#2A2A2A] opacity-60'}`}>
                            {!isEarned && (
                                <div className="absolute top-2 right-2 text-gray-400">
                                    <Lock size={12} />
                                </div>
                            )}
                            <div className={`p-3 rounded-full mb-3 ${isEarned ? badge.bg : 'bg-gray-100 dark:bg-[#1E1E1E]'}`}>
                                <Icon size={24} className={isEarned ? badge.color : 'text-gray-400'} />
                            </div>
                            <h4 className={`font-bold text-sm ${isEarned ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{badge.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{badge.desc}</p>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default AchievementBadges;
