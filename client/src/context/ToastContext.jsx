import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, Trophy, Zap, Flame, Bell, CheckCircle2, AlertCircle } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type = 'info', title, message, icon }) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { id, type, title, message, icon };
        setToasts((prev) => [...prev, newToast]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col space-y-4 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} {...toast} onRemove={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ type, title, message, icon, onRemove }) => {
    const icons = {
        levelUp: <Trophy className="text-yellow-500" size={24} />,
        achievement: <Zap className="text-primary-600 dark:text-primary-400" size={24} />,
        streak: <Flame className="text-orange-500" size={24} />,
        success: <CheckCircle2 className="text-green-500" size={24} />,
        error: <AlertCircle className="text-red-500" size={24} />,
        info: <Bell className="text-blue-500" size={24} />,
    };

    return (
        <div className="pointer-events-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl dark:shadow-none border border-gray-100 dark:border-gray-800 p-4 flex items-start space-x-4 min-w-[320px] max-w-[400px] animate-in slide-in-from-right-10 duration-300">
            <div className="flex-shrink-0 mt-1">
                {icon || icons[type] || icons.info}
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight">{title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{message}</p>
            </div>
            <button onClick={onRemove} className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};

export const useToast = () => useContext(ToastContext);
