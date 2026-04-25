import React from 'react';
import { Card } from '../ui';
import { Trophy, Medal, Flame } from 'lucide-react';

const Leaderboard = () => {
    // Mock data for the leaderboard
    const leaders = [
        { id: 1, name: 'Alice Chen', xp: 2450, level: 12, streak: 14, rank: 1 },
        { id: 2, name: 'Bob Smith', xp: 2100, level: 10, streak: 5, rank: 2 },
        { id: 3, name: 'You', xp: 1850, level: 9, streak: 7, rank: 3 },
        { id: 4, name: 'David Lee', xp: 1600, level: 8, streak: 2, rank: 4 },
        { id: 5, name: 'Eve Davis', xp: 1450, level: 7, streak: 1, rank: 5 },
    ];

    return (
        <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-xl">
                    <Trophy size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Leaderboard</h3>
                    <p className="text-xs text-gray-500">Ranked by XP gained this week</p>
                </div>
            </div>

            <div className="space-y-3">
                {leaders.map(leader => (
                    <div 
                        key={leader.id} 
                        className={`flex items-center justify-between p-3 rounded-xl border ${leader.name === 'You' ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-900/50' : 'bg-white border-gray-100 dark:bg-[#1E1E1E] dark:border-[#2A2A2A]'}`}
                    >
                        <div className="flex items-center gap-4">
                            <span className={`font-black text-lg ${leader.rank === 1 ? 'text-yellow-500' : leader.rank === 2 ? 'text-gray-400' : leader.rank === 3 ? 'text-amber-600' : 'text-gray-300 dark:text-gray-600'}`}>
                                #{leader.rank}
                            </span>
                            <div>
                                <p className={`font-bold ${leader.name === 'You' ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                    {leader.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                    <span>Lvl {leader.level}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5 text-orange-500"><Flame size={12}/> {leader.streak}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-gray-900 dark:text-white">{leader.xp}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">XP</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default Leaderboard;
