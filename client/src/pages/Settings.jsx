import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/ui';
import {
    User,
    Settings as SettingsIcon,
    Bell,
    Shield,
    Target,
    Moon,
    Sun,
    CheckCircle2
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [settings, setSettings] = useState({
        dailyFocusGoal: 120,
        dailyTaskGoal: 5,
        aiInsightsEnabled: true,
        notificationsEnabled: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                const data = res.data.data;
                setSettings({
                    dailyFocusGoal: data.dailyFocusGoal,
                    dailyTaskGoal: data.dailyTaskGoal,
                    aiInsightsEnabled: data.aiInsightsEnabled,
                    notificationsEnabled: data.notificationsEnabled
                });
            } catch (err) {
                console.error('Failed to fetch settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            await api.patch('/settings', settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            alert('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <p className="text-gray-400 dark:text-gray-500 font-medium animate-pulse">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your profile, goals, and platform preferences.</p>
                </div>
                {success && (
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl border border-green-100 dark:border-green-800 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-bold">Changes saved!</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Nav */}
                <div className="space-y-1">
                    {[
                        { id: 'profile', icon: User, label: 'Profile Info' },
                        { id: 'goals', icon: Target, label: 'Focus Goals' },
                        { id: 'app', icon: SettingsIcon, label: 'App Settings' },
                        { id: 'security', icon: Shield, label: 'Security' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${item.id === 'goals'
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="md:col-span-3 space-y-8">
                    {/* User Info */}
                    <Card>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Profile Information</h3>
                        <div className="flex items-start space-x-6">
                            <div className="h-20 w-20 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-2xl uppercase">
                                {user?.name?.[0]}
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
                                    <Input value={user?.name} disabled className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Email Address</label>
                                    <Input value={user?.email} disabled className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Productivity Goals */}
                    <Card>
                        <div className="flex items-center space-x-3 mb-6">
                            <Target className="text-primary-600 dark:text-primary-400" size={24} />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Productivity Goals</h3>
                        </div>
                        <form onSubmit={handleUpdateSettings} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Daily Focus (Minutes)</label>
                                    <Input
                                        type="number"
                                        value={settings.dailyFocusGoal}
                                        onChange={(e) => setSettings({ ...settings, dailyFocusGoal: parseInt(e.target.value) })}
                                    />
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Total intentional study/work time per day.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Daily Tasks</label>
                                    <Input
                                        type="number"
                                        value={settings.dailyTaskGoal}
                                        onChange={(e) => setSettings({ ...settings, dailyTaskGoal: parseInt(e.target.value) })}
                                    />
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Target number of task completions per day.</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/30">
                                <div className="flex items-center space-x-3">
                                    <Sun className="text-primary-600 dark:text-primary-400" size={20} />
                                    <div>
                                        <p className="text-sm font-bold text-primary-900 dark:text-primary-100">AI Adaptive Suggestions</p>
                                        <p className="text-xs text-primary-600/80 dark:text-primary-400/80">Allow Gemini to dynamically adjust these goals based on performance.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, aiInsightsEnabled: !settings.aiInsightsEnabled })}
                                    className={`h-6 w-11 rounded-full p-1 transition-colors ${settings.aiInsightsEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <div className={`h-4 w-4 bg-white rounded-full transition-transform ${settings.aiInsightsEnabled ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" loading={saving}>Save Goal Preferences</Button>
                            </div>
                        </form>
                    </Card>

                    {/* Platform Preferences */}
                    <Card>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                            <SettingsIcon className="mr-2 text-gray-400 dark:text-gray-500" size={20} /> Platform Preferences
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center space-x-3">
                                    <Moon size={20} className="text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                                </div>
                                <button 
                                    onClick={toggleTheme}
                                    className={`h-6 w-11 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <div className={`h-4 w-4 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-gray-50 dark:border-gray-800">
                                <div className="flex items-center space-x-3">
                                    <Bell size={20} className="text-gray-400 dark:text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</span>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
                                    className={`h-6 w-11 rounded-full p-1 transition-colors ${settings.notificationsEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <div className={`h-4 w-4 bg-white rounded-full transition-transform ${settings.notificationsEnabled ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Settings;
