import React, { useState } from 'react';
import api from '../api/axios';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { token } = useParams();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }

        try {
            const { data } = await api.post(`/auth/reset-password/${token}`, { password });
            setMessage(data.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message || 'Failed to reset password');
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
                            Reset Password
                        </h1>
                        <p className="text-gray-600">
                            Enter your new password below.
                        </p>
                    </div>

                    {message ? (
                        <div className="text-center">
                            <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-6">
                                {message}
                            </div>
                            <p className="text-gray-600">Redirecting to login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                                    New Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="confirmPassword">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-primary focus:border-transparent transition-all outline-none text-gray-900 placeholder-gray-500"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full py-4 bg-primary hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 flex items-center justify-center space-x-2 cursor-pointer"
                            >
                                <span>Reset Password</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            </button>
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

export default ResetPassword;
