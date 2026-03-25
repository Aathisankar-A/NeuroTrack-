import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import * as authApi from '../../api/auth.api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authApi.register(formData);
            navigate('/login', { state: { message: 'Account created! Please sign in.' } });
        } catch (err) {
            if (err.response?.data?.issues) {
                // Handle Zod validation issues
                const fieldErrors = err.response.data.issues;
                const firstError = Object.values(fieldErrors)[0][0];
                setError(firstError);
            } else {
                setError(err.response?.data?.error || 'Registration failed. Try again.');
            }
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
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Join NeuroTrack to optimize your focus
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">
                                Full Name
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <User size={18} />
                                </span>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    className="input pl-10 h-12"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">
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
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Lock size={18} />
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    className="input pl-10 h-12"
                                    placeholder="Min 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
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
                            <>
                                <span>Get Started</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
