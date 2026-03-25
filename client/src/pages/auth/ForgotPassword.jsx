import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Failed to send reset email. Please check the address and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4 py-12 transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 dark:shadow-primary-900/20 mb-6">
                        <span className="text-white text-3xl font-bold italic">N</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Enter your email and we'll send you a reset link.
                    </p>
                </div>

                {sent ? (
                    <div className="flex flex-col items-center space-y-4 py-4">
                        <CheckCircle2 size={48} className="text-green-500" />
                        <p className="text-center text-gray-700 dark:text-gray-300 font-medium">
                            If an account exists for <span className="font-bold text-primary-600">{email}</span>, a reset link has been sent.
                        </p>
                        <Link
                            to="/login"
                            className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1"
                        >
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 rounded-lg">
                                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
                                    htmlFor="email"
                                >
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <Mail size={18} />
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        className="input pl-10 h-12"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full h-12 flex items-center justify-center space-x-2 text-lg"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <span>Send Reset Link</span>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            Remember your password?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
