import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { Sparkles, Loader2, AlertCircle, CheckCircle, XCircle, BrainCircuit, RefreshCw, ChevronRight, BookOpen, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import AskAiSection from '../components/ai/AskAiSection';
import { getCollections, getResources } from '../api/resource.api';

const AIAssistant = () => {
    const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'guide'

    // Quiz State
    const [step, setStep] = useState('setup'); // setup, loading_quiz, active, evaluating, result
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [numQuestions, setNumQuestions] = useState(5);
    
    // Resource Selection State
    const [useResources, setUseResources] = useState(false);
    const [collections, setCollections] = useState([]);
    const [selectedCollectionId, setSelectedCollectionId] = useState('');
    const [resourceIds, setResourceIds] = useState([]);
    
    // Quiz Progress State
    const [quizData, setQuizData] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(false);

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
        if (!topic.trim()) return;

        setStep('loading_quiz');
        setError(false);
        try {
            const res = await api.post('/quiz/generate', { 
                topic, 
                difficulty, 
                numQuestions,
                useResources,
                resourceIds: useResources ? resourceIds : [] 
            });
            const generated = res.data.data;
            if (!generated || !Array.isArray(generated) || generated.length === 0) {
                setError(true);
                setStep('setup');
            } else {
                setQuizData(generated);
                setUserAnswers(new Array(generated.length).fill(''));
                setStep('active');
            }
        } catch (err) {
            console.error('Quiz Generation Error:', err);
            setError(true);
            setStep('setup');
        }
    };

    const handleAnswerSelect = (qIndex, option) => {
        const newAnswers = [...userAnswers];
        newAnswers[qIndex] = option;
        setUserAnswers(newAnswers);
    };

    const handleSubmitQuiz = async () => {
        setStep('evaluating');
        setError(false);
        try {
            const res = await api.post('/quiz/evaluate', { quizData, userAnswers });
            if (res.data.data) {
                setResult(res.data.data);
                setStep('result');
            } else {
                setError(true);
                setStep('active');
            }
        } catch (err) {
            console.error('Quiz Evaluation Error:', err);
            setError(true);
            setStep('active');
        }
    };

    const resetQuiz = () => {
        setQuizData([]);
        setUserAnswers([]);
        setResult(null);
        setStep('setup');
        setTopic('');
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:items-start">
                <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-widest mb-2">
                    <BrainCircuit size={14} />
                    <span>AI Questioning Center</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Generate targeted quizzes or comprehensive study guides.</p>
            </div>

            {/* Tab Navigation */}
            {(step === 'setup' || activeTab === 'guide') && (
                <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 pb-px">
                    <button
                        onClick={() => setActiveTab('quiz')}
                        className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${
                            activeTab === 'quiz' 
                                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        Interactive Quiz
                    </button>
                    <button
                        onClick={() => setActiveTab('guide')}
                        className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${
                            activeTab === 'guide' 
                                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        Study Guide Generator
                    </button>
                </div>
            )}

            {/* Guide View */}
            {activeTab === 'guide' && (
                <div className="-mt-12">
                    <AskAiSection />
                </div>
            )}

            {/* Quiz View */}
            {activeTab === 'quiz' && (
                <div className="animate-in fade-in duration-500">
                    {error && (
                        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center space-x-3">
                            <AlertCircle size={20} />
                            <p className="font-medium">An error occurred while connecting to the AI. Please try again.</p>
                        </div>
                    )}

                    {step === 'setup' && (
                        <Card className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                            <form onSubmit={handleGenerate} className="space-y-6 max-w-lg mx-auto">
                                <div className="text-center mb-8">
                                    <Sparkles size={48} className="mx-auto text-primary-400 dark:text-primary-600 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure Your Quiz</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Topic or Subject</label>
                                    <input 
                                        type="text"
                                        required
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="e.g. Dynamic Programming, Cellular Biology..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                    />
                                </div>

                                {/* Resource Options */}
                                <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="quizUseRes"
                                            checked={useResources}
                                            onChange={(e) => setUseResources(e.target.checked)}
                                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-600"
                                        />
                                        <label htmlFor="quizUseRes" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                            Base questions on my resources
                                        </label>
                                    </div>

                                    {useResources && collections.length > 0 && (
                                        <div className="pt-2 animate-in slide-in-from-top-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-2">
                                                Select Context Collection
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={selectedCollectionId}
                                                    onChange={handleCollectionChange}
                                                    className="w-full appearance-none px-4 py-3 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 outline-none"
                                                >
                                                    {collections.map(c => (
                                                        <option key={c._id} value={c._id}>{c.title}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">
                                                Includes {resourceIds.length} resources to guide the AI.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                                        <select 
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Questions</label>
                                        <select 
                                            value={numQuestions}
                                            onChange={(e) => setNumQuestions(Number(e.target.value))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                                        >
                                            <option value={3}>3 Questions</option>
                                            <option value={5}>5 Questions</option>
                                            <option value={10}>10 Questions</option>
                                        </select>
                                    </div>
                                </div>

                                <Button type="submit" disabled={!topic.trim()} className="w-full py-4 flex justify-center items-center gap-2">
                                    <BrainCircuit size={18} /> Generate AI Quiz
                                </Button>
                            </form>
                        </Card>
                    )}

                    {(step === 'loading_quiz' || step === 'evaluating') && (
                        <div className="h-[40vh] flex flex-col items-center justify-center space-y-4">
                            <Loader2 size={48} className="text-primary-600 dark:text-primary-400 animate-spin" />
                            <div className="text-center mt-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {step === 'loading_quiz' ? 'Generating Your Quiz...' : 'Grading Your Answers...'}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    {step === 'loading_quiz' ? 'Gemini is formulating challenging questions.' : 'Gemini is analyzing your mistakes.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 'active' && quizData.length > 0 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 px-6 py-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="font-bold text-primary-600 dark:text-primary-400">
                                    Topic: <span className="text-gray-900 dark:text-white ml-2">{topic}</span>
                                </div>
                                <Badge variant="primary">{quizData.length} Questions</Badge>
                            </div>

                            {quizData.map((q, qIndex) => (
                                <Card key={qIndex} className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex gap-3">
                                        <span className="text-gray-400 dark:text-gray-500">Q{qIndex + 1}.</span> {q.question}
                                    </h3>
                                    <div className="space-y-3 pl-8">
                                        {q.options.map((opt, oIndex) => {
                                            const isSelected = userAnswers[qIndex] === opt;
                                            return (
                                                <button
                                                    key={oIndex}
                                                    onClick={() => handleAnswerSelect(qIndex, opt)}
                                                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                                                        isSelected 
                                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100' 
                                                        : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                                            {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-primary-500" />}
                                                        </div>
                                                        <span>{opt}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Card>
                            ))}

                            <div className="flex justify-between pt-4">
                                <Button onClick={resetQuiz} className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300">
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmitQuiz} className="px-8 py-4 flex items-center gap-2">
                                    Submit Answers <ChevronRight size={18} />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'result' && result && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <Card className="p-8 text-center relative overflow-hidden bg-primary-900 dark:bg-black text-white border-none">
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6">
                                        <span className="text-4xl font-black">{result.score}<span className="text-xl text-primary-300">/{result.total}</span></span>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
                                    <p className="text-primary-100 max-w-md mx-auto italic text-lg opacity-90 leading-relaxed mb-6">"{result.feedback}"</p>
                                    <Button onClick={resetQuiz} className="bg-white text-primary-900 hover:bg-primary-50 px-8 py-3 font-bold border-none flex items-center gap-2">
                                        <RefreshCw size={18} /> Generate Another
                                    </Button>
                                </div>
                                <div className="absolute -right-20 -top-20 h-64 w-64 bg-primary-500/30 rounded-full blur-[80px] pointer-events-none" />
                                <div className="absolute -left-10 -bottom-10 h-40 w-40 bg-primary-300/20 rounded-full blur-[60px] pointer-events-none" />
                            </Card>

                            {result.incorrectDetails && result.incorrectDetails.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-8">Review Mistakes</h3>
                                    <div className="space-y-4">
                                        {result.incorrectDetails.map((inc, i) => (
                                            <Card key={i} className="p-6">
                                                <p className="font-bold text-gray-900 dark:text-white mb-4">{inc.question}</p>
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-200">
                                                        <XCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
                                                        <div>
                                                            <span className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-1">Your Answer</span>
                                                            {inc.your_answer}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 text-green-800 dark:text-green-200">
                                                        <CheckCircle size={18} className="shrink-0 mt-0.5 text-green-500" />
                                                        <div>
                                                            <span className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-1">Correct Answer</span>
                                                            {inc.correct_answer}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
