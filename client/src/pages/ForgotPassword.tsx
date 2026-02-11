import React, { useState } from 'react';
import api from '../api/axios';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setMessage(data.message);
            // alert('Password reset link sent to your email');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message || 'Failed to send reset link');
            } else {
                alert('An unexpected error occurred');
            }
        }
    };

    return (
        <div className="font-display transition-colors duration-300 antialiased overflow-hidden">
            <main className="relative min-h-screen w-full flex items-center justify-center animated-bg p-4">
                {/* Animated Shapes */}
                <div className="shape bg-blue-400 w-96 h-96 -top-20 -left-20 animate-pulse"></div>
                <div className="shape bg-purple-400 w-80 h-80 -bottom-20 -right-20 animate-bounce" style={{ animationDuration: '10s' }}></div>
                <div className="shape bg-teal-300 w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30"></div>

                <div className="glass-card w-full max-w-md p-10 rounded-3xl shadow-2xl relative z-10">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-black mb-2">
                            Forgot Password
                        </h1>
                        <p className="text-gray-600">
                            Enter your email to receive a password reset link.
                        </p>
                    </div>

                    {message ? (
                        <div className="text-center">
                            <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-6">
                                {message}
                            </div>
                            <button 
                                onClick={() => navigate('/login')}
                                className="w-full py-4 bg-primary hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 cursor-pointer"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full py-4 bg-primary hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 flex items-center justify-center space-x-2 cursor-pointer"
                            >
                                <span>Send Reset Link</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            </button>
                            
                            <div className="text-center mt-4">
                                <button 
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-gray-500 hover:text-gray-700 text-sm hover:underline cursor-pointer"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="absolute bottom-6 left-0 right-0 text-center">
                    <p className="text-white/60 text-sm">© 2026 Premium Web App. All rights reserved.</p>
                </div>
            </main>
        </div>
    );
};

export default ForgotPassword;
