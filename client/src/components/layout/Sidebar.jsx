import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Timer,
    CheckSquare,
    BarChart3,
    Cpu,
    BrainCircuit,
    Settings,
    LogOut,
    Library
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const links = [
        { to: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { to: '/sessions', name: 'Focus Sessions', icon: <Timer size={20} /> },
        { to: '/tasks', name: 'Tasks', icon: <CheckSquare size={20} /> },
        { to: '/analytics', name: 'Analytics', icon: <BarChart3 size={20} /> },
        { to: '/resources', name: 'Resources', icon: <Library size={20} /> },
        { to: '/ai-insights', name: 'AI Insights', icon: <Cpu size={20} /> },
        { to: '/quiz', name: 'AI Assistant', icon: <BrainCircuit size={20} /> },
        { to: '/settings', name: 'Settings', icon: <Settings size={20} /> },
    ];

    // XP constants (matching backend)
    const getXpForLevel = (level) => {
        if (level <= 1) return 0;
        return Math.floor(100 * Math.pow(1.5, level - 1));
    };

    const currentLevel = user?.level || 1;
    const currentXp = user?.xp || 0;
    const baseLevelXp = getXpForLevel(currentLevel);
    const nextLevelXp = getXpForLevel(currentLevel + 1);
    const progress = Math.min(100, Math.round(((currentXp - baseLevelXp) / (nextLevelXp - baseLevelXp)) * 100));

    return (
        <div className="h-full w-64 bg-white dark:bg-[#121212] border-r border-gray-200 dark:border-[#1E1E1E] flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    NeuroTrack
                </h1>

                {/* User Cognitive Rank Section */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-[#1E1E1E] rounded-xl border border-gray-100 dark:border-[#2A2A2A]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Cognitive Level</span>
                        <span className="text-sm font-black text-primary-600 dark:text-primary-400">{currentLevel}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-600 transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="mt-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 text-right">
                        {currentXp} / {nextLevelXp} XP
                    </p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                : 'text-gray-500 dark:text-[#9CA3AF] hover:bg-gray-50 dark:hover:bg-[#1E1E1E] hover:text-gray-900 dark:hover:text-[#E5E5E5]'
                            }`
                        }
                    >
                        {link.icon}
                        <span className="font-medium text-sm">{link.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-[#1E1E1E]">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
