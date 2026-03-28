import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui';
import { useTheme } from '../context/ThemeContext';
import {
    BarChart3,
    TrendingUp,
    Calendar,
    ChevronDown,
    Info,
    CheckCircle2,
    PieChart,
    Clock,
    Target,
    Sparkles
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import api from '../api/axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Analytics = () => {
    const [overviewData, setOverviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics/overview');
                setOverviewData(res.data.data);
            } catch (err) {
                console.error('Failed to fetch analytics', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <BarChart3 size={48} className="text-primary-600 dark:text-primary-400 animate-pulse" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Loading Analytics...</h3>
            </div>
        );
    }

    if (error || !overviewData) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <BarChart3 size={48} className="text-red-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Failed to load analytics</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Please refresh the page or try again later.</p>
            </div>
        );
    }

    const {
        todayFocusMinutes = 0,
        weeklyFocusMinutes = 0,
        sessionsCompleted = 0,
        tasksCompleted = 0,
        taskCompletionRate = 0,
        subjectDistribution = [],
        dailyFocus = []
    } = overviewData || {};

    // Line Chart Data — dailyFocus is already oldest→newest from the server
    const lineChartData = {
        labels: dailyFocus.map(d => new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })),
        datasets: [
            {
                label: 'Focus Minutes',
                data: dailyFocus.map(d => d.minutes),
                fill: true,
                borderColor: 'rgb(14, 165, 233)',
                backgroundColor: theme === 'dark' ? 'rgba(14, 165, 233, 0.05)' : 'rgba(14, 165, 233, 0.1)',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: theme === 'dark' ? '#0ea5e9' : '#fff',
                pointBorderWidth: 2,
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                titleColor: theme === 'dark' ? '#f3f4f6' : '#111827',
                bodyColor: theme === 'dark' ? '#d1d5db' : '#4b5563',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { display: false },
                ticks: { color: theme === 'dark' ? '#6b7280' : '#9ca3af', font: { size: 11, weight: '600' } }
            },
            x: {
                grid: { display: false },
                ticks: { color: theme === 'dark' ? '#6b7280' : '#9ca3af', font: { size: 11, weight: '600' } }
            },
        },
    };

    // Doughnut Chart Data
    const doughnutData = {
        labels: subjectDistribution.map(s => s.subject),
        datasets: [
            {
                data: subjectDistribution.map(s => s.minutes),
                backgroundColor: [
                    'rgba(14, 165, 233, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                ],
                borderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderWidth: 2,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: theme === 'dark' ? '#d1d5db' : '#4b5563',
                    font: { size: 12, weight: '500' },
                    padding: 20,
                    usePointStyle: true,
                }
            },
            tooltip: {
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                titleColor: theme === 'dark' ? '#f3f4f6' : '#111827',
                bodyColor: theme === 'dark' ? '#d1d5db' : '#4b5563',
                borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12,
            },
        },
        cutout: '70%',
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1E1E1E] pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E5E5E5] tracking-tight">Performance Analytics</h1>
                    <p className="text-gray-500 dark:text-[#9CA3AF] mt-1 font-medium">Deep-dive into your cognitive trends and efficiency.</p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2A2A2A] rounded-xl font-medium text-gray-700 dark:text-[#E5E5E5] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-all text-sm">
                    <Calendar size={18} className="text-gray-400 dark:text-gray-500" />
                    <span>Last 7 Days</span>
                    <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
                </button>
            </div>

            {/* AI Micro-Insight */}
            <Card className="bg-gradient-to-r from-primary-50 to-white dark:from-primary-900/10 dark:to-[#1E1E1E] border-none shadow-sm relative overflow-hidden flex items-start gap-5 p-6 rounded-xl">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-500" />
                <div className="p-3 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-xl shrink-0">
                    <Sparkles size={24} />
                </div>
                <div className="relative z-10">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest mb-1.5">Pattern Recognized</h3>
                    <p className="text-gray-900 dark:text-[#E5E5E5] font-semibold text-lg leading-snug tracking-tight">You are most productive in morning sessions. Schedule high-context goals before 1 PM for optimal flow.</p>
                </div>
            </Card>

            {/* Productivity Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="flex items-center space-x-4 p-5 hover:border-primary-200 dark:hover:border-[#2A2A2A] transition-all duration-300">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-wider">Today Focus</p>
                        <h3 className="text-xl font-black text-gray-900 dark:text-[#E5E5E5] mt-0.5">{todayFocusMinutes} <span className="text-xs font-medium text-gray-500">m</span></h3>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4 p-5 hover:border-primary-200 dark:hover:border-[#2A2A2A] transition-all duration-300">
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-wider">Weekly Focus</p>
                        <h3 className="text-xl font-black text-gray-900 dark:text-[#E5E5E5] mt-0.5">{weeklyFocusMinutes} <span className="text-xs font-medium text-gray-500">m</span></h3>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4 p-5 hover:border-primary-200 dark:hover:border-[#2A2A2A] transition-all duration-300">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-wider">Tasks Done</p>
                        <h3 className="text-xl font-black text-gray-900 dark:text-[#E5E5E5] mt-0.5">{tasksCompleted}</h3>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4 p-5 hover:border-primary-200 dark:hover:border-[#2A2A2A] transition-all duration-300">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
                        <Target size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-wider">Win Rate</p>
                        <h3 className="text-xl font-black text-gray-900 dark:text-[#E5E5E5] mt-0.5">{taskCompletionRate}%</h3>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="min-h-[400px] flex flex-col p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-[#E5E5E5]">Focus Time Chart</h3>
                            <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF] mt-0.5">Daily focus minutes (Last 7 Days)</p>
                        </div>
                        <div className="p-2 bg-primary-50 dark:bg-[#2A2A2A] text-primary-600 dark:text-primary-400 rounded-xl">
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        {dailyFocus.length > 0 ? (
                            <Line data={lineChartData} options={lineOptions} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 dark:text-[#9CA3AF] text-sm font-medium italic">Not enough data to show trend.</div>
                        )}
                    </div>
                </Card>

                <Card className="min-h-[400px] flex flex-col p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-[#E5E5E5]">Subject Distribution</h3>
                            <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF] mt-0.5">Where your focus time went</p>
                        </div>
                        <div className="p-2 bg-primary-50 dark:bg-[#2A2A2A] text-primary-600 dark:text-primary-400 rounded-xl">
                            <PieChart size={18} />
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 relative flex items-center justify-center">
                        {subjectDistribution.length > 0 ? (
                            <div className="relative w-full h-[300px]">
                                <Doughnut data={doughnutData} options={doughnutOptions} />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none md:pr-32 pr-24">
                                    <div className="text-center">
                                         <p className="text-3xl font-black text-gray-900 dark:text-[#E5E5E5]">{sessionsCompleted}</p>
                                         <p className="text-[10px] font-bold text-gray-400 dark:text-[#9CA3AF] uppercase tracking-widest mt-0.5">Sessions</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 dark:text-[#9CA3AF] text-sm font-medium italic">No subject data available.</div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
