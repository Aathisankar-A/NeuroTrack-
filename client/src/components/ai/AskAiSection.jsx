import React, { useState, useEffect } from 'react';
import { Card, Button } from '../ui';
import { Sparkles, Loader2, BookOpen, AlertCircle, FileQuestion, ChevronDown } from 'lucide-react';
import { generateQuestions } from '../../api/ai.api';
import { getCollections, getResources } from '../../api/resource.api';

const AskAiSection = () => {
    const [topic, setTopic] = useState('');
    const [useResources, setUseResources] = useState(false);
    const [collections, setCollections] = useState([]);
    const [selectedCollectionId, setSelectedCollectionId] = useState('');
    const [resourceIds, setResourceIds] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (useResources && collections.length === 0) {
            fetchCollections();
        }
    }, [useResources]);

    const fetchCollections = async () => {
        try {
            const { data } = await getCollections();
            if (data.success && data.data.length > 0) {
                setCollections(data.data);
                setSelectedCollectionId(data.data[0]._id);
                fetchResourcesForCollection(data.data[0]._id);
            }
        } catch (err) {
            console.error('Failed to fetch collections', err);
        }
    };

    const fetchResourcesForCollection = async (collectionId) => {
        try {
            const { data } = await getResources(collectionId);
            if (data.success) {
                // By default, select all resources in the collection for the prompt
                setResourceIds(data.data.map(r => r._id));
            }
        } catch (err) {
            console.error('Failed to fetch resources', err);
        }
    };

    const handleCollectionChange = (e) => {
        const cId = e.target.value;
        setSelectedCollectionId(cId);
        fetchResourcesForCollection(cId);
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const { data } = await generateQuestions({
                topic,
                useResources,
                resourceIds: useResources ? resourceIds : []
            });

            if (data.success && !data.data.error) {
                setResult(data.data);
            } else {
                setError('Failed to generate valid questions. Please try another topic.');
            }
        } catch (err) {
            console.error('AI Generation error:', err);
            setError('An error occurred during generation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-[#1E1E1E]">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-[#E5E5E5] flex items-center gap-2">
                    <BookOpen className="text-primary-600" />
                    Ask AI / Study Guide Generator
                </h2>
                <p className="text-gray-500 dark:text-[#9CA3AF] mt-1 font-medium">
                    Generate conceptual and practice questions for any topic.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Generation Form */}
                <div className="lg:col-span-1 border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-6 bg-white dark:bg-[#1E1E1E]">
                    <form onSubmit={handleGenerate} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Study Topic
                            </label>
                            <input
                                type="text"
                                required
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. React Hooks, Thermodynamics"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-[#2A2A2A] rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-600 outline-none transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="useRes"
                                checked={useResources}
                                onChange={(e) => setUseResources(e.target.checked)}
                                className="w-5 h-5 text-primary-600 border-gray-300 dark:border-[#2A2A2A] rounded dark:bg-[#121212] focus:ring-primary-600"
                            />
                            <label htmlFor="useRes" className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                                Use my saved resources as context
                            </label>
                        </div>

                        {useResources && collections.length > 0 && (
                            <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-500/20">
                                <label className="block text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400 mb-2">
                                    Select Collection
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedCollectionId}
                                        onChange={handleCollectionChange}
                                        className="w-full appearance-none px-4 py-2 bg-white dark:bg-[#1E1E1E] border border-primary-200 dark:border-[#2A2A2A] rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 outline-none cursor-pointer"
                                    >
                                        {collections.map(c => (
                                            <option key={c._id} value={c._id}>{c.title}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                <div className="mt-2 text-xs text-primary-600 dark:text-primary-500 font-medium">
                                    {resourceIds.length} resources will be analyzed.
                                </div>
                            </div>
                        )}

                        {useResources && collections.length === 0 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                You don't have any collections yet. Create some in the Resources tab!
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            disabled={loading || !topic} 
                            className="w-full justify-center flex items-center gap-2 py-3"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            Generate Study Guide
                        </Button>
                    </form>
                </div>

                {/* Results Display */}
                <div className="lg:col-span-2">
                    {error && (
                        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/20 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="font-medium text-sm">{error}</p>
                        </div>
                    )}

                    {!result && !loading && !error && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 dark:border-[#2A2A2A] rounded-2xl bg-gray-50/50 dark:bg-[#121212]/50">
                            <FileQuestion className="w-12 h-12 text-gray-300 dark:text-[#2A2A2A] mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Awaiting Topic</h3>
                            <p className="text-gray-500 dark:text-[#9CA3AF] max-w-sm text-sm font-medium">
                                Enter a topic and we'll generate high-quality conceptual and practice questions to guide your session.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-gray-100 dark:border-[#2A2A2A] rounded-2xl bg-white dark:bg-[#1E1E1E]">
                            <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Synthesizing Notes...</h3>
                            <p className="text-gray-500 dark:text-[#9CA3AF] text-sm font-medium">
                                Building context-aware questions utilizing Gemini...
                            </p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Conceptual */}
                            {result.conceptual && result.conceptual.length > 0 && (
                                <Card className="p-6 border-l-4 border-l-purple-500 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                                        Conceptual Understanding
                                    </h3>
                                    <div className="space-y-4">
                                        {result.conceptual.map((item, idx) => (
                                            <div key={idx} className="bg-gray-50 dark:bg-[#121212] p-4 rounded-xl border border-gray-100 dark:border-[#2A2A2A]">
                                                <p className="font-semibold text-gray-800 dark:text-[#E5E5E5] text-[15px]">{item.q}</p>
                                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-2 bg-purple-50 dark:bg-purple-900/10 py-1.5 px-3 rounded-lg inline-block">
                                                    Hint: {item.hint}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Practice */}
                            {result.practice && result.practice.length > 0 && (
                                <Card className="p-6 border-l-4 border-l-blue-500 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        Practice & Application
                                    </h3>
                                    <div className="space-y-4">
                                        {result.practice.map((item, idx) => (
                                            <div key={idx} className="bg-gray-50 dark:bg-[#121212] p-4 rounded-xl border border-gray-100 dark:border-[#2A2A2A]">
                                                <p className="font-semibold text-gray-800 dark:text-[#E5E5E5] text-[15px]">{item.q}</p>
                                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-900/10 py-1.5 px-3 rounded-lg inline-block">
                                                    Hint: {item.hint}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AskAiSection;
