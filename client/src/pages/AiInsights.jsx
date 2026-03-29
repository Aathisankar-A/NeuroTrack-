import React, { useState } from 'react';
import { Card, Button } from '../components/ui';
import {
    Sparkles,
    Loader2,
    AlertCircle,
    FileText,
    Zap,
    Target,
    Lightbulb
} from 'lucide-react';
import api from '../api/axios';

const AIInsights = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const generateInsights = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await api.post('/ai/analyze');
            if (res.data.data.error || !res.data.data.summary) {
                 setError(true);
            } else {
                 setData(res.data.data);
            }
        } catch (err) {
            console.error('Failed to generate AI insights:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const formatList = (text, dotColor = "bg-primary-500") => {
        if (!text) return null;
        // Split text by newlines or periods to create natural bullet points
        const points = text.split(/(?:\n|\.\s+)/).filter(p => p.trim().length > 3);
        
        return (
            <ul className="space-y-3 mt-4">
                {points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-2 shrink-0 opacity-80`} />
                        <span className="text-gray-600 dark:text-[#9CA3AF] leading-relaxed text-sm md:text-[15px]">{point.trim()}{point.endsWith('.') ? '' : '.'}</span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-[#1E1E1E]">
                <div>
                    <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-widest mb-2">
                        <Sparkles size={14} />
                        <span>AI Powered Analysis</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E5E5E5] tracking-tight">Cognitive Insights</h1>
                    <p className="text-gray-500 dark:text-[#9CA3AF] mt-1 font-medium">Generate personalized performance analysis based on your recent activity.</p>
                </div>
                <Button onClick={generateInsights} disabled={loading} className="flex items-center gap-2 whitespace-nowrap px-6">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {data ? 'Regenerate' : 'Generate Insights'}
                </Button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/20 flex items-center space-x-3">
                    <AlertCircle size={20} />
                    <p className="font-medium">Unable to generate insights. Please try again.</p>
                </div>
            )}

            {!data && !loading && !error && (
                <Card className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-[#2A2A2A] bg-gray-50/50 dark:bg-[#1E1E1E]/50 shadow-none">
                    <Sparkles size={48} className="mx-auto text-gray-300 dark:text-[#2A2A2A] mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-[#E5E5E5]">Ready to Analyze</h3>
                    <p className="text-gray-500 dark:text-[#9CA3AF] max-w-sm mx-auto mt-2 mb-6 font-medium">
                        Click the button above to securely analyze your focus sessions and tasks for personalized insights.
                    </p>
                </Card>
            )}

            {loading && (
                <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
                    <Loader2 size={48} className="text-primary-600 dark:text-primary-400 animate-spin" />
                    <div className="text-center mt-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-[#E5E5E5]">Analyzing Your Patterns</h3>
                        <p className="text-gray-500 dark:text-[#9CA3AF] text-sm mt-1 font-medium">Gemini is processing your deep work history...</p>
                    </div>
                </div>
            )}

            {data && !loading && !error && (
                <div className="space-y-6">
                    {/* Summary */}
                    <Card className="p-6 border-l-4 border-l-primary-500 bg-gradient-to-r from-primary-50/50 to-white dark:from-primary-900/10 dark:to-[#1E1E1E]">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl shrink-0">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-[#E5E5E5] mb-2">Weekly Summary</h3>
                                <p className="text-gray-700 dark:text-[#9CA3AF] leading-relaxed text-base md:text-lg font-medium tracking-tight bg-white/50 dark:bg-[#1E1E1E]/50 rounded-xl">{data.summary}</p>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <Card className="p-6 hover:border-green-200 dark:hover:border-[#2A2A2A] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                                    <Zap size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-[#E5E5E5]">Strengths</h3>
                            </div>
                            {formatList(data.strengths, 'bg-green-500')}
                        </Card>

                        {/* Weak Areas */}
                        <Card className="p-6 hover:border-orange-200 dark:hover:border-[#2A2A2A] transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                                    <Target size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-[#E5E5E5]">Weak Areas</h3>
                            </div>
                            {formatList(data.weak_areas, 'bg-orange-500')}
                        </Card>
                    </div>

                    {/* Suggestions */}
                    <Card className="p-8 bg-gray-900 dark:bg-[#151515] border-none text-white relative overflow-hidden flex flex-col justify-center min-h-[160px] shadow-lg">
                        <div className="relative z-10 flex items-start gap-5">
                            <div className="p-3 bg-white/10 text-yellow-400 rounded-xl shrink-0 backdrop-blur-md border border-white/5">
                                <Lightbulb size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Actionable Suggestion</h3>
                                <div className="text-gray-300 text-lg leading-relaxed italic font-medium">
                                    "{data.suggestions}"
                                </div>
                            </div>
                        </div>
                        {/* Minimal geometric backgrounds */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AIInsights;
