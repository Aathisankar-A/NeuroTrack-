import React from 'react';
import { Bell, User, Search, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const TopBar = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="h-16 bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-[#1E1E1E] flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="relative w-96">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Search size={18} />
                </span>
                <input
                    type="text"
                    placeholder="Search performance metrics..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2A2A2A] rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm dark:text-[#E5E5E5]"
                />
            </div>

            <div className="flex items-center space-x-6">
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-xl bg-gray-50 dark:bg-[#1E1E1E] text-gray-500 dark:text-[#9CA3AF] hover:text-primary-600 dark:hover:text-primary-400 transition-all border border-gray-200 dark:border-[#2A2A2A]"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                <button className="text-gray-500 dark:text-[#9CA3AF] hover:text-gray-900 dark:hover:text-white relative">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center space-x-3 pl-6 border-l border-gray-100 dark:border-[#1E1E1E]">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-[#E5E5E5] uppercase">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-[#9CA3AF] first-letter:uppercase">{user?.role}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold border-2 border-white dark:border-[#1E1E1E] shadow-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
