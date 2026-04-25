import React from 'react';
import { Card } from '../ui';
import { UserCircle, AlertCircle, CheckCircle } from 'lucide-react';

const PostureTracker = ({ postureScore, slouching }) => {
    return (
        <Card className="p-4 bg-white dark:bg-[#1E1E1E]">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl ${slouching ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-green-50 text-green-500 dark:bg-green-900/20'}`}>
                    <UserCircle size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Posture</h4>
                    <p className="text-xs text-gray-500">Local AI Tracking</p>
                </div>
            </div>

            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Alignment Score</span>
                <span className={`text-lg font-black ${slouching ? 'text-red-500' : 'text-green-500'}`}>{postureScore}%</span>
            </div>

            <div className="h-1.5 w-full bg-gray-100 dark:bg-[#2A2A2A] rounded-full overflow-hidden mb-3">
                <div 
                    className={`h-full transition-all duration-500 ${slouching ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${postureScore}%` }}
                />
            </div>

            {slouching && (
                <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">Slouching detected. Please sit up straight to prevent back pain.</p>
                </div>
            )}
            {!slouching && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-medium">
                    <CheckCircle size={14} />
                    <span>Posture is good</span>
                </div>
            )}
        </Card>
    );
};

export default PostureTracker;
