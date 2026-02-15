import React, { useState } from 'react';
import api from '../api/axios';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LiquidChrome from '../components/LightRays';
import ThemeToggle from '../components/ThemeToggle';

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
            <main className="relative min-h-screen w-full flex items-center justify-center bg-gray-900 p-4">
                {/* Theme Toggle in Corner */}
                <div className="fixed top-6 right-6 z-20">
                    <ThemeToggle />
                </div>

                {/* Liquid Chrome Background */}
                <div className="absolute inset-0 z-0">
                    <LiquidChrome 
                        raysOrigin="top-center"
                        raysColor="#ffffff"
                        raysSpeed={1}
                        lightSpread={0.5}
                        rayLength={3}
                        followMouse={true}
                        mouseInfluence={0.1}
                        noiseAmount={0}
                        distortion={0}
                        className="custom-rays"
                        pulsating={false}
                        fadeDistance={1}
                        saturation={1}
                    />
                </div>

                <div className="w-full max-w-md p-10 rounded-[32px] shadow-2xl relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 transition-all duration-500">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Forgot Password
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Enter your email to receive a password reset link.
                        </p>
                    </div>

                    {message ? (
                        <div className="text-center">
                            <div className="bg-emerald-100/50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl mb-6 border border-emerald-200 dark:border-emerald-500/20">
                                {message}
                            </div>
                            <button 
                                onClick={() => navigate('/login')}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/30 cursor-pointer"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 cursor-pointer"
                            >
                                <span>Send Reset Link</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            </button>
                            
                            <div className="text-center mt-4">
                                <button 
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-sm hover:underline cursor-pointer"
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
