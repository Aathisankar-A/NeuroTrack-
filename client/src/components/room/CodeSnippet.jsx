import React from 'react';
import { Terminal } from 'lucide-react';

// Basic implementation of a code snippet viewer for chat.
// In a full implementation, this could use PrismJS or similar for syntax highlighting.
const CodeSnippet = ({ code, language = 'javascript' }) => {
    return (
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-[#2A2A2A] my-2">
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-[#2A2A2A]">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-gray-500" />
                    <span className="text-xs font-bold text-gray-500 dark:text-[#9CA3AF] uppercase tracking-wider">{language}</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#121212] overflow-x-auto custom-scrollbar">
                <pre className="text-sm font-mono text-gray-800 dark:text-[#E5E5E5] whitespace-pre-wrap word-break-all">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );
};

export default CodeSnippet;
