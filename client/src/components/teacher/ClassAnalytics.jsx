import React from 'react';
import { Card } from '../ui';
import { Target, AlertTriangle, Users } from 'lucide-react';

const ClassAnalytics = ({ students = [] }) => {
    // Generate some mock aggregates based on students
    const avgFocus = students.length > 0 ? Math.floor(Math.random() * 20) + 70 : 0;
    const strugglingCount = students.length > 0 ? Math.floor(Math.random() * (students.length / 3)) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 flex items-center gap-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-xl">
                    <Target size={20} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Avg Focus</p>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white">{avgFocus}%</h4>
                </div>
            </Card>

            <Card className="p-4 flex items-center gap-4">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fatigue Alerts</p>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white">{strugglingCount}</h4>
                </div>
            </Card>

            <Card className="p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                    <Users size={20} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Now</p>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white">{students.length}</h4>
                </div>
            </Card>
        </div>
    );
};

export default ClassAnalytics;
