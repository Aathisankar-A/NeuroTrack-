import React from 'react';
import { User, Users, Activity } from 'lucide-react';
import { Card } from '../ui';

const ParticipantList = ({ participants = [] }) => {
    return (
        <Card className="p-5">
            <h3 className="text-sm font-bold text-gray-500 dark:text-[#9CA3AF] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users size={16} />
                Participants ({participants.length})
            </h3>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {participants.map((p, idx) => (
                    <div key={p.id || idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                {p.name ? p.name.charAt(0) : 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{p.name || 'Anonymous User'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{p.role || 'Member'}</p>
                            </div>
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs font-medium border border-green-100 dark:border-green-900/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            {p.status || 'Focused'}
                        </div>
                    </div>
                ))}

                {participants.length === 0 && (
                    <div className="text-center py-6">
                        <User className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={24} />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">It's quiet... too quiet.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ParticipantList;
