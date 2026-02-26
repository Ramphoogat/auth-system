import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import LightRays from './LightRays';
import { logActivity } from '../utils/activityLogger';

const Error404: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const isAuthenticated = !!token;

    const handleGoBack = () => {
        logActivity("INFO", "Navigation", "Returned from 404 Error Page");
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="font-display antialiased min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute inset-0 z-0">
                <LightRays
                    raysOrigin="top-left"
                    raysColor="#10b981"
                    raysSpeed={0.5}
                    lightSpread={0.8}
                    rayLength={3}
                    followMouse={true}
                    mouseInfluence={0.05}
                    noiseAmount={0.2}
                    distortion={0.1}
                    className="opacity-40"
                />
            </div>

            <div className="relative z-10 text-center px-4">
                {/* Animated 404 Text */}
                <div className="relative mb-8 select-none">
                    <h1 className="text-[150px] md:text-[200px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-600 opacity-20 animate-pulse">
                        404
                    </h1>
                </div>

                {/* Content Card */}
                <div className="max-w-md mx-auto p-8 rounded-[40px] bg-white/10 dark:bg-gray-800/40 backdrop-blur-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl transition-all duration-500 hover:scale-[1.01]">
                    <h2 className="text-3xl font-bold text-white mb-4">Lost in Space?</h2>
                    <p className="text-gray-400 mb-8 text-lg">
                        The page you are looking for doesn't exist or has been moved to another dimension.
                    </p>

                    <button
                        onClick={handleGoBack}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center space-x-3 transition-all duration-300 shadow-xl shadow-emerald-500/20 active:scale-95 group"
                    >
                        <FiHome className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>{isAuthenticated ? 'Return to Dashboard' : 'Go Back Home'}</span>
                    </button>
                </div>

                {/* Decorative Quote */}
                <div className="mt-12 text-emerald-500/50 italic text-sm font-medium">
                    "Not all those who wander are lost... but you might be."
                </div>
            </div>

            {/* Footer Branding */}
            <div className="absolute bottom-6 left-0 right-0 text-center text-gray-500 text-sm">
                © 2026 AdminPanel. All rights reserved.
            </div>
        </div>
    );
};

export default Error404;
