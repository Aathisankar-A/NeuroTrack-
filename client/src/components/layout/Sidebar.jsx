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
    Library,
    Users,
    GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const links = [
        { to: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { to: '/sessions', name: 'Focus Sessions', icon: <Timer size={20} /> },
        { to: '/rooms', name: 'Study Rooms', icon: <Users size={20} /> },
        { to: '/tasks', name: 'Tasks', icon: <CheckSquare size={20} /> },
        { to: '/analytics', name: 'Analytics', icon: <BarChart3 size={20} /> },
        { to: '/resources', name: 'Resources', icon: <Library size={20} /> },
        { to: '/ai-insights', name: 'AI Insights', icon: <Cpu size={20} /> },
        { to: '/quiz', name: 'AI Assistant', icon: <BrainCircuit size={20} /> },
        { to: '/settings', name: 'Settings', icon: <Settings size={20} /> },
    ];

    if (user?.role === 'teacher' || user?.role === 'admin') {
        links.splice(1, 0, { to: '/teacher', name: 'Teacher Dashboard', icon: <GraduationCap size={20} /> });
    }

    return (
        <div className="h-full w-64 bg-white dark:bg-[#121212] border-r border-gray-200 dark:border-[#1E1E1E] flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    NeuroTrack
                </h1>
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
