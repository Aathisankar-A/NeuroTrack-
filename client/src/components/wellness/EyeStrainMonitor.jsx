import React from 'react';
import { Card } from '../ui';
import { Eye, Coffee, AlertTriangle } from 'lucide-react';

const EyeStrainMonitor = ({ eyeStrainLevel, needsBreak, takeBreak }) => {
    return (
        <Card className="p-4 bg-white dark:bg-[#1E1E1E]">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${eyeStrainLevel === 'High' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : eyeStrainLevel === 'Medium' ? 'bg-amber-50 text-amber-500 dark:bg-amber-900/20' : 'bg-blue-50 text-blue-500 dark:bg-blue-900/20'}`}>
                        <Eye size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Eye Strain</h4>
                        <p className="text-xs text-gray-500">20-20-20 Rule</p>
                    </div>
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded ${eyeStrainLevel === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : eyeStrainLevel === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {eyeStrainLevel}
                </span>
            </div>

            {needsBreak ? (
                <div className="p-3 bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-900/30 rounded-lg text-center">
                    <AlertTriangle size={24} className="mx-auto text-primary-500 mb-2" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Time for an eye break!</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Look at something 20 feet away for 20 seconds.</p>
                    <button onClick={takeBreak} className="w-full py-1.5 bg-primary-600 text-white rounded-md text-xs font-bold hover:bg-primary-700 transition-colors">
                        I've Rested My Eyes
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#121212] rounded-lg">
                    <Coffee size={16} className="text-gray-400" />
                    <p className="text-xs text-gray-500">Blink rate is normal. Keep focusing.</p>
                </div>
            )}
        </Card>
    );
};

export default EyeStrainMonitor;
