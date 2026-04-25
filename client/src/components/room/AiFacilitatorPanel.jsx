import React, { useState } from 'react';
import { Bot, Sparkles, MessageSquare, Loader2, X, BrainCircuit, Coffee, FileText } from 'lucide-react';
import { Button } from '../ui';
import api from '../../api/axios';
import { useSocket } from '../../context/SocketContext';
import useAuth from '../../hooks/useAuth';

const AiFacilitatorPanel = ({ roomId, isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [topic, setTopic] = useState('');
    const socket = useSocket();
    const { user } = useAuth();

    const triggerAction = async (actionType) => {
        setLoading(true);
        setAiResponse('');
        try {
            // Mocking different actions for the UI until backend routes are fully extended
            let promptMessage = "";
            let responseText = "";

            if (actionType === 'quiz') {
                responseText = "Here is a quick quiz based on your notes:\n1. What is the main difference between synchronous and asynchronous code?\n2. Explain the concept of closures in JavaScript.";
                promptMessage = responseText;
            } else if (actionType === 'summarize') {
                responseText = "Summary: The group has been discussing productivity techniques and focus modes. Key takeaway: Using the Pomodoro timer effectively reduces burnout.";
                promptMessage = responseText;
            } else if (actionType === 'break') {
                responseText = "You've been studying for a while! I recommend taking a 5-minute break to stretch and hydrate.";
                promptMessage = responseText;
            } else if (actionType === 'analyze') {
                const chatHistory = "Recent discussion about productivity techniques.";
                const context = "Focus mode session for university students.";
                const res = await api.post(`/rooms/${roomId}/ai/ask`, { chatHistory, context });
                responseText = res.data.data.response;
                promptMessage = responseText;
            }

            setAiResponse(responseText);

            if (promptMessage && promptMessage !== "NO_ACTION_NEEDED" && socket && user) {
                socket.emit('chat:message', {
                    roomId,
                    sender: {
                        _id: 'neurobot',
                        name: '🤖 NeuroBot',
                    },
                    content: promptMessage,
                    type: 'system',
                    createdAt: new Date().toISOString(),
                });
            }
        } catch (err) {
            console.error("AI Error:", err);
            setAiResponse("I'm having trouble connecting right now.");
        } finally {
            setLoading(false);
        }
    };

    const getPrompt = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const res = await api.post(`/rooms/${roomId}/ai/prompt`, { topic });
            const promptText = res.data.data.prompt;
            setAiResponse(promptText);

            if (socket && user) {
                socket.emit('chat:message', {
                    roomId,
                    sender: {
                        _id: 'neurobot',
                        name: '🤖 NeuroBot',
                    },
                    content: `Here's a discussion question to get you started: ${promptText}`,
                    type: 'system',
                    createdAt: new Date().toISOString(),
                });
            }
        } catch (err) {
            console.error("AI Error:", err);
            setAiResponse("Failed to generate prompt.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-16 right-4 w-80 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] z-50 overflow-hidden flex flex-col animate-in slide-in-from-right-8 duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#2A2A2A] bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                        <Bot size={18} />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">NeuroBot Facilitator</span>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <X size={18} />
                </button>
            </div>
            
            <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    I'm here to help guide your study session, unblock your team, and spark interesting discussions.
                </p>

                <div className="grid grid-cols-2 gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="justify-start gap-2 h-auto py-2 px-3 border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                        onClick={() => triggerAction('quiz')}
                        disabled={loading}
                    >
                        <BrainCircuit size={14} className="shrink-0" />
                        <span className="text-xs text-left">Generate Quiz</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="justify-start gap-2 h-auto py-2 px-3 border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                        onClick={() => triggerAction('summarize')}
                        disabled={loading}
                    >
                        <FileText size={14} className="shrink-0" />
                        <span className="text-xs text-left">Summarize</span>
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="justify-start gap-2 h-auto py-2 px-3 border-amber-100 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-300 col-span-2"
                        onClick={() => triggerAction('break')}
                        disabled={loading}
                    >
                        <Coffee size={14} className="shrink-0" />
                        <span className="text-xs text-left">Recommend Break</span>
                    </Button>
                </div>

                <div className="bg-gray-50 dark:bg-[#1E1E1E] rounded-xl p-3 border border-gray-100 dark:border-[#2A2A2A]">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Generate Topic Prompt</p>
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            placeholder="e.g. Machine Learning"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            className="flex-1 min-w-0 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#2A2A2A] rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                        <Button size="sm" onClick={getPrompt} disabled={loading || !topic} className="px-3 shrink-0">
                            <Sparkles size={14} />
                        </Button>
                    </div>
                </div>

                <Button 
                    variant="outline" 
                    className="w-full justify-center gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                    onClick={() => triggerAction('analyze')}
                    disabled={loading}
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                    {loading ? 'Analyzing...' : 'Analyze Chat & Facilitate'}
                </Button>

                {aiResponse && aiResponse !== "NO_ACTION_NEEDED" && (
                    <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-xl animate-in fade-in zoom-in-95">
                        <p className="text-sm text-indigo-900 dark:text-indigo-200 whitespace-pre-line">
                            {aiResponse}
                        </p>
                    </div>
                )}
                {aiResponse === "NO_ACTION_NEEDED" && (
                    <div className="mt-2 text-center text-sm text-green-600 dark:text-green-400 font-medium">
                        Everything looks great! No intervention needed.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiFacilitatorPanel;
