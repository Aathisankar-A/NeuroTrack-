import React from 'react';
import { Card } from '../ui';
import { Brain, Zap, Activity } from 'lucide-react';

const StudentCard = ({ student, classroomId }) => {
    // Mocking real-time cognitive metrics for the student
    const focusLevel = Math.floor(Math.random() * 40) + 60; // 60-100
    const fatigueAlert = Math.random() > 0.8;
    const tasksCompleted = Math.floor(Math.random() * 10);

    const getStatusColor = (focus) => {
        if (fatigueAlert) return 'bg-red-500';
        if (focus >= 80) return 'bg-green-500';
        if (focus >= 60) return 'bg-amber-500';
        return 'bg-gray-400';
    };

    return (
        <Card className="p-5 flex flex-col h-full hover:border-primary-200 dark:hover:border-primary-900/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold uppercase">
                            {student.name.substring(0, 2)}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#1E1E1E] ${getStatusColor(focusLevel)}`}></div>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{student.name}</h4>
                        <p className="text-xs font-medium text-gray-500">Level {student.level} • {student.xp} XP</p>
                    </div>
                </div>
                {fatigueAlert && (
                    <span className="px-2 py-1 text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-md uppercase tracking-wider">
                        Struggling
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="bg-gray-50 dark:bg-[#121212] p-2.5 rounded-lg border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <Zap size={14} className={focusLevel >= 80 ? 'text-green-500' : 'text-amber-500'} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Focus</span>
                    </div>
                    <span className="text-lg font-black text-gray-900 dark:text-white">{focusLevel}%</span>
                </div>
                <div className="bg-gray-50 dark:bg-[#121212] p-2.5 rounded-lg border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <Activity size={14} className="text-primary-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Tasks</span>
                    </div>
                    <span className="text-lg font-black text-gray-900 dark:text-white">{tasksCompleted}</span>
                </div>
            </div>
        </Card>
    );
};

export default StudentCard;
