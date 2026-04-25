import React from 'react';
import { Card } from '../ui';
import { Swords, Clock } from 'lucide-react';

const FocusDuel = () => {
    return (
        <Card className="p-6 bg-gradient-to-br from-primary-900 to-primary-950 border-none text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Swords size={120} />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Swords size={20} className="text-primary-300" />
                    <h3 className="text-xl font-black uppercase tracking-wide">Focus Duel</h3>
                </div>
                <p className="text-primary-200 text-sm max-w-[200px] mb-6">Challenge a friend to a 60-minute deep focus sprint. Winner takes the NeuroCoins.</p>
                
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-primary-200 uppercase tracking-widest">Active Duel</span>
                        <div className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/20 px-2 py-0.5 rounded">
                            <Clock size={12} />
                            <span>42:15 left</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <div className="text-center">
                            <div className="w-10 h-10 rounded-full bg-primary-500 mx-auto flex items-center justify-center font-bold mb-1 border-2 border-white/20">YOU</div>
                            <span className="text-xs font-bold text-primary-200">12m focused</span>
                        </div>
                        
                        <div className="text-xl font-black text-primary-400 italic">VS</div>
                        
                        <div className="text-center">
                            <div className="w-10 h-10 rounded-full bg-purple-500 mx-auto flex items-center justify-center font-bold mb-1 border-2 border-white/20">AL</div>
                            <span className="text-xs font-bold text-primary-200">10m focused</span>
                        </div>
                    </div>
                </div>

                <button className="w-full py-2.5 bg-white text-primary-900 rounded-xl font-bold hover:bg-primary-50 transition-colors shadow-lg">
                    New Challenge
                </button>
            </div>
        </Card>
    );
};

export default FocusDuel;
