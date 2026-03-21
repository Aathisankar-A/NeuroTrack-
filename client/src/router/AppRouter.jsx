import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import ProtectedRoute from './ProtectedRoute';

// Real Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import Sessions from '../pages/Sessions';
import Tasks from '../pages/Tasks';
import Analytics from '../pages/Analytics';
import AIInsights from '../pages/AiInsights';
import Quiz from '../pages/Quiz';
import Settings from '../pages/Settings';
import Resources from '../pages/Resources';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={
                        <ErrorBoundary>
                            <AppLayout />
                        </ErrorBoundary>
                    }>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/sessions" element={<Sessions />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/ai-insights" element={<AIInsights />} />
                        <Route path="/quiz" element={<Quiz />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                </Route>

                {/* Catch All */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
