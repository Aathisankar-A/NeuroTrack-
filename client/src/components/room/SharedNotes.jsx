import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { FileText, Save, Bold, Italic, List, Code, Download, FileSignature, Sparkles, MessageSquareQuote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Button } from '../ui';

const SharedNotes = ({ roomId }) => {
    const [content, setContent] = useState('');
    const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview'
    const [isSaving, setIsSaving] = useState(false);
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on('notes:update:received', (newContent) => {
            setContent(newContent);
        });

        return () => {
            socket.off('notes:update:received');
        };
    }, [socket]);

    const handleChange = (e) => {
        const newContent = e.target.value;
        setContent(newContent);
        
        setIsSaving(true);
        if (socket && roomId) {
            socket.emit('notes:update', { roomId, content: newContent });
        }
        setTimeout(() => setIsSaving(false), 500);
    };

    const insertFormat = (format) => {
        const textarea = document.getElementById('notes-editor');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        
        let newText = '';
        let newCursorPos = start;

        switch (format) {
            case 'bold':
                newText = text.substring(0, start) + '**' + text.substring(start, end) + '**' + text.substring(end);
                newCursorPos = end + 2;
                break;
            case 'italic':
                newText = text.substring(0, start) + '_' + text.substring(start, end) + '_' + text.substring(end);
                newCursorPos = end + 1;
                break;
            case 'heading':
                newText = text.substring(0, start) + '\n### ' + text.substring(start, end) + text.substring(end);
                newCursorPos = start + 5;
                break;
            case 'list':
                newText = text.substring(0, start) + '\n- ' + text.substring(start, end) + text.substring(end);
                newCursorPos = start + 3;
                break;
            case 'code':
                newText = text.substring(0, start) + '\n```\n' + text.substring(start, end) + '\n```\n' + text.substring(end);
                newCursorPos = start + 4;
                break;
            case 'math':
                newText = text.substring(0, start) + '\n$$\n' + text.substring(start, end) + '\n$$\n' + text.substring(end);
                newCursorPos = start + 3;
                break;
            default:
                break;
        }

        setContent(newText);
        if (socket && roomId) socket.emit('notes:update', { roomId, content: newText });

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([content], {type: 'text/markdown'});
        element.href = URL.createObjectURL(file);
        element.download = `Study_Notes_${roomId}.md`;
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-[#2A2A2A] overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-b border-gray-100 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1E1E1E] gap-2">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                    <FileText size={18} className="text-primary-500" />
                    <span>Shared Notes</span>
                    {isSaving && (
                        <span className="text-[10px] text-gray-400 font-normal ml-2 flex items-center gap-1">
                            <Save size={12} className="animate-pulse" /> Saving...
                        </span>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-200 dark:bg-[#2A2A2A] p-1 rounded-lg">
                        <button 
                            onClick={() => setViewMode('edit')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${viewMode === 'edit' ? 'bg-white dark:bg-[#121212] shadow-sm text-primary-600' : 'text-gray-500'}`}
                        >
                            Edit
                        </button>
                        <button 
                            onClick={() => setViewMode('preview')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${viewMode === 'preview' ? 'bg-white dark:bg-[#121212] shadow-sm text-primary-600' : 'text-gray-500'}`}
                        >
                            Preview
                        </button>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDownload} className="h-7 px-2 text-xs" title="Export Notes">
                        <Download size={14} />
                    </Button>
                </div>
            </div>

            {viewMode === 'edit' && (
                <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] overflow-x-auto">
                    <button onClick={() => insertFormat('bold')} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded"><Bold size={14} /></button>
                    <button onClick={() => insertFormat('italic')} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded"><Italic size={14} /></button>
                    <button onClick={() => insertFormat('heading')} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded text-xs font-bold">H3</button>
                    <button onClick={() => insertFormat('list')} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded"><List size={14} /></button>
                    <button onClick={() => insertFormat('code')} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded"><Code size={14} /></button>
                    <button onClick={() => insertFormat('math')} className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] rounded font-serif italic text-xs font-bold">fx</button>
                </div>
            )}

            <div className="flex-1 relative overflow-hidden flex flex-col">
                {viewMode === 'edit' ? (
                    <textarea
                        id="notes-editor"
                        value={content}
                        onChange={handleChange}
                        placeholder="Start typing markdown here... Use the toolbar or standard syntax like **bold**."
                        className="flex-1 w-full p-4 resize-none focus:outline-none bg-transparent text-gray-900 dark:text-white text-sm leading-relaxed custom-scrollbar font-mono"
                    />
                ) : (
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar prose dark:prose-invert max-w-none prose-sm">
                        {content ? (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    code({node, inline, className, children, ...props}) {
                                        return (
                                            <code className={`${className} bg-gray-100 dark:bg-gray-800 rounded px-1`} {...props}>
                                                {children}
                                            </code>
                                        )
                                    }
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        ) : (
                            <div className="text-gray-400 italic text-sm">Nothing to preview. Switch to Edit mode to start typing.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedNotes;
