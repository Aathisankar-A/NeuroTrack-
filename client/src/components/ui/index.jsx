import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes.
 */
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const Card = ({ children, className }) => {
    return (
        <div className={cn("bg-white dark:bg-[#1E1E1E] rounded-xl p-6 border border-gray-100 dark:border-[#2A2A2A] shadow-sm", className)}>
            {children}
        </div>
    );
};

export const Button = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
        outline: 'border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] text-gray-700 dark:text-[#E5E5E5] hover:bg-gray-50 dark:hover:bg-[#2A2A2A]',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm',
        error: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
        ghost: 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A2A]',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
        icon: 'p-2',
    };

    return (
        <button
            className={cn(
                "rounded-xl font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2",
                variants[variant] || variants.primary,
                sizes[size] || sizes.md,
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export const Badge = ({ children, variant = 'default' }) => {
    const variants = {
        default: 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-700 dark:text-[#E5E5E5]',
        success: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
        warning: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
        error: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
        primary: 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400',
    };

    return (
        <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider", variants[variant])}>
            {children}
        </span>
    );
};

export const Input = ({ className, error, ...props }) => {
    return (
        <div className="w-full">
            <input
                className={cn(
                    "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-[#E5E5E5]",
                    "placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500",
                    "transition-all duration-200 font-medium",
                    error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1.5 text-xs font-bold text-red-500 ml-1">{error}</p>}
        </div>
    );
};
