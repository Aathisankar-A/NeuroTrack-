import React from 'react';
import { MessageSquare, Video } from 'lucide-react';

const InterventionPanel = ({ classroomId }) => {
    const handleMessage = () => {
        alert('Broadcast message to classroom: ' + classroomId);
    };

    const handleBreakout = () => {
        alert('Start breakout session for classroom: ' + classroomId);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleMessage}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#2A2A2A] dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
                <MessageSquare size={16} />
                <span>Message Class</span>
            </button>
            <button
                onClick={handleBreakout}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-medium transition-colors border border-primary-100 dark:border-primary-900/50"
            >
                <Video size={16} />
                <span>Start Breakout</span>
            </button>
        </div>
    );
};

export default InterventionPanel;
