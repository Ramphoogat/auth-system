import React, { useState } from 'react';
import api from '../api/axios';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import LightRays from './LightRays';
import ThemeComponent from './ThemeComponent';
import { useToast } from './ToastProvider';
import { logActivity } from '../utils/activityLogger';

const VerifyOtp: React.FC = () => {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';
    const role = location.state?.role || 'user'; // Get role from Signup or default to 'user'

    const { showSuccess } = useToast();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                email,
                otp,
                role // Send role so backend knows which profile to verify
            };
            const { data } = await api.post('/auth/verify-otp', payload);
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.result.role);

            // Redirect based on the verified role - all now use unified /dashboard
            showSuccess("Logged in successfully!");
            logActivity("UPDATE", "Security", `Verified OTP for ${email}`);
            navigate('/dashboard');
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message || 'Verification failed');
            } else {
                alert('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            const payload = { email };
            await api.post('/auth/resend-otp', payload);
            alert('OTP resent successfully!');
            logActivity("UPDATE", "Security", `Resent OTP for ${email}`);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message || 'Failed to resend OTP');
            }
        }
    };

    return (
        <div className="font-display antialiased m-0 p-0 flex min-h-screen bg-gray-900 relative overflow-y-auto no-scrollbar py-12 md:py-0 items-center justify-center">
            {/* Theme Toggle in Corner */}
            <div className="fixed top-6 right-6 z-20">
                <ThemeComponent />
            </div>

            {/* LightRays Background */}
            <div className="absolute inset-0 z-0">
                <LightRays
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

            <div className="w-full max-w-md px-4 z-10">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 shadow-2xl rounded-[32px] p-10 transition-all duration-500 relative">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Verify OTP</h1>
                        <p className="text-gray-600 dark:text-gray-400">Enter the code sent to your <span className="font-semibold text-gray-900 dark:text-white">email</span></p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{email}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="otp">
                                One-Time Password
                            </label>
                            <input
                                id="otp"
                                type="text"
                                placeholder="••••••"
                                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400 text-center tracking-widest text-2xl font-bold"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-primary hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : (
                                <>
                                    <span>Verify & Continue</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                </>
                            )}
                        </button>

                        <div className="flex flex-col gap-3 mt-4">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer font-medium"
                            >
                                Resend OTP
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-sm hover:underline cursor-pointer text-center"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-white/60 text-sm">© 2026 Premium Web App. All rights reserved.</p>
            </div>
        </div>
    );
};

export default VerifyOtp;
