import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiArrowRight,
    FiShield,
    FiLayout,
    FiUsers,
    FiSettings,
    FiTrendingUp,
    FiRefreshCw,
    FiArrowUpCircle,
    FiList
} from "react-icons/fi";
import ThemeComponent from "../../components/ThemeComponent";
import LiquidChrome from "../../components/LightRays";
import { useTheme } from "../../context/themeContext";

export const FadeUp = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut", delay }}
        className={className}
    >
        {children}
    </motion.div>
);

const roleData = {
    user: {
        title: "User Dashboard",
        desc: "Basic profile access, daily activity usage, and the ability to initiate role-upgrade requests.",
        mock: (
            <div className="flex flex-col gap-4 p-6 h-full text-gray-900 dark:text-white">
                <div className="font-bold flex items-center gap-2 text-lg mb-4 text-emerald-600 dark:text-emerald-400">
                    <FiUsers /> Profile Overview
                </div>
                <div className="flex items-center gap-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-2xl shadow-sm dark:shadow-none">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-lg border-2 border-white/20"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-4 w-2/3 bg-gray-200 dark:bg-white/20 rounded-full"></div>
                        <div className="h-3 w-1/3 bg-gray-100 dark:bg-white/10 rounded-full"></div>
                    </div>
                </div>
                <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition">
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">Request Role Upgrade</span>
                    <FiArrowRight className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        )
    },
    editor: {
        title: "Editor Dashboard",
        desc: "Dedicated review queues, editorial tools, and integrated Calendar scheduling for content management.",
        mock: (
            <div className="flex flex-col gap-4 p-6 h-full text-gray-900 dark:text-white">
                <div className="font-bold flex items-center gap-2 text-lg mb-4 text-purple-600 dark:text-purple-400">
                    <FiLayout /> Review Queue
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex justify-between items-center shadow-sm dark:shadow-none">
                            <div className="space-y-2 w-1/2">
                                <div className="h-3 bg-gray-200 dark:bg-white/20 rounded w-full"></div>
                                <div className="h-2 bg-gray-100 dark:bg-white/10 rounded w-2/3"></div>
                            </div>
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] rounded-full uppercase tracking-wider font-bold">Pending</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    author: {
        title: "Author Dashboard",
        desc: "Robust drafting tools, interactive Kanban board for personal workflows, and content creation.",
        mock: (
            <div className="flex flex-col gap-4 p-6 h-full text-gray-900 dark:text-white">
                <div className="font-bold flex items-center gap-2 text-lg mb-4 text-cyan-600 dark:text-cyan-400">
                    <FiList /> Kanban Workflow
                </div>
                <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-sm dark:shadow-none">
                        <div className="h-4 bg-gray-200 dark:bg-white/20 rounded w-1/2 mb-2"></div>
                        <div className="h-16 bg-gray-100 dark:bg-white/10 rounded-xl"></div>
                        <div className="h-16 bg-gray-50 dark:bg-white/10 rounded-xl opacity-50"></div>
                    </div>
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-sm dark:shadow-none">
                        <div className="h-4 bg-gray-200 dark:bg-white/20 rounded w-1/2 mb-2"></div>
                        <div className="h-20 bg-cyan-50 dark:bg-cyan-500/20 border border-cyan-200 dark:border-cyan-500/30 rounded-xl"></div>
                    </div>
                </div>
            </div>
        )
    },
    admin: {
        title: "Admin Dashboard",
        desc: "System analytics, User Management tables, and Global Settings configuration.",
        mock: (
            <div className="flex flex-col gap-4 p-6 h-full text-gray-900 dark:text-white">
                <div className="flex justify-between items-center mb-4">
                    <div className="font-bold flex items-center gap-2 text-lg text-emerald-600 dark:text-emerald-400">
                        <FiSettings /> Governance
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold animate-pulse">Mode 1 Active</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="h-24 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex items-end p-4 shadow-sm dark:shadow-none">
                        <div className="w-full flex items-end gap-2 h-full">
                            {[40, 70, 45, 90, 60].map((h, i) => (
                                <div key={i} className="flex-1 bg-emerald-400 dark:bg-emerald-500/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>
                    <div className="h-24 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 flex flex-col justify-center shadow-sm dark:shadow-none">
                        <div className="text-3xl font-black text-gray-900 dark:text-white">1,204</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium"><FiTrendingUp /> +12% this week</div>
                    </div>
                </div>
            </div>
        )
    }
};

const marqueeItems = ["React 19", "TypeScript", "Tailwind CSS v4", "Node.js", "Express v5", "MongoDB", "Framer Motion", "Mongoose", "Resend", "Google Calendar API"];

export default function HomePage() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isLoggedIn = !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
    const [activeTab, setActiveTab] = useState<keyof typeof roleData>("user");

    const isLight = theme === 'light';

    return (
        <main className="relative min-h-screen bg-gray-50 dark:bg-black overflow-hidden font-display text-gray-900 dark:text-white selection:bg-emerald-500/30 transition-colors duration-500">

            {/* 1. Base Layer: WebGL Background */}
            <div className="fixed inset-0 z-0">
                <LiquidChrome
                    raysOrigin="top-center"
                    raysColor={isLight ? "#14b8a6" : "#10b981"}
                    raysSpeed={0.5}
                    lightSpread={0.8}
                    rayLength={5}
                    followMouse={true}
                    mouseInfluence={0.05}
                    noiseAmount={0}
                    distortion={0}
                    className={`custom-rays ${isLight ? 'opacity-30 mix-blend-multiply' : 'opacity-40 dark:opacity-60 mix-blend-screen'}`}
                    pulsating={true}
                    fadeDistance={1}
                    saturation={1}
                />
            </div>

            {/* Navbar overlaying background */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] lg:w-[90%] max-w-7xl flex items-center justify-between px-6 py-4 md:px-8 backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl z-50 transition-all duration-500">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">A</div>
                    <span className="text-xl font-bold tracking-tight hidden md:block text-gray-900 dark:text-white">AuthSystem</span>
                </div>
                <div className="flex items-center gap-6">
                    <ThemeComponent />
                    {isLoggedIn ? (
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95"
                        >
                            Dashboard <FiArrowRight />
                        </button>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <button
                                onClick={() => navigate("/login")}
                                className="text-gray-600 dark:text-gray-300 font-semibold hover:text-emerald-500 dark:hover:text-white transition-colors text-sm sm:text-base"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate("/signup")}
                                className="px-5 py-2 sm:px-6 sm:py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-emerald-500 text-gray-900 hover:text-white dark:text-white rounded-lg font-bold backdrop-blur-md transition-all duration-300 border border-transparent dark:border-white/10 shadow-sm dark:shadow-lg active:scale-95 text-sm sm:text-base"
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* 2. UI Layer: Glassmorphism layout */}
            <div className="relative z-10 mx-auto px-6 pt-40 pb-24 w-full">

                {/* Section 1: The Hero */}
                <section className="flex flex-col items-center text-center max-w-5xl mx-auto mb-32">
                    <FadeUp delay={0.1}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            v1.0 Production Ready
                        </div>
                    </FadeUp>

                    <FadeUp delay={0.2}>
                        <h1 className="text-5xl md:text-7xl lg:text-[90px] font-black tracking-tight mb-8 leading-[1.05] text-gray-900 dark:text-white">
                            Next-Generation Authentication {" "}
                            <span className="block mt-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 dark:from-emerald-400 dark:via-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                                & Role-Based Access.
                            </span>
                        </h1>
                    </FadeUp>

                    <FadeUp delay={0.3}>
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mb-12 leading-relaxed">
                            A production-ready full-stack ecosystem featuring secure OTP authentication, 4-tier role governance, and bi-directional Google Calendar sync. Built for scale.
                        </p>
                    </FadeUp>

                    <FadeUp delay={0.4} className="flex flex-col sm:flex-row items-center gap-4">
                        <button onClick={() => navigate("/signup")} className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white text-lg rounded-xl font-bold transition-all shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] dark:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95">
                            Get Started <FiArrowRight />
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white shadow-sm dark:shadow-none text-lg rounded-xl font-bold backdrop-blur-md transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95">
                            View Live Demo
                        </button>
                    </FadeUp>

                    {/* Hero Visual Mockup */}
                    <FadeUp delay={0.6} className="mt-20 w-full perspective-1000">
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative mx-auto max-w-4xl"
                        >
                            {/* Glow behind */}
                            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 dark:from-emerald-500/30 dark:to-cyan-500/30 rounded-[3rem] blur-3xl opacity-50"></div>

                            {/* Dashboard Image / Mockup base */}
                            <div className="relative bg-white/80 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 h-64 md:h-96 w-full flex flex-col transform rotate-x-6 scale-95 origin-bottom">
                                <div className="h-12 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center px-6 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="flex-1 flex p-6 gap-6 opacity-80 dark:opacity-70">
                                    <div className="w-1/4 h-full rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10"></div>
                                    <div className="w-3/4 flex flex-col gap-6">
                                        <div className="h-1/3 w-full rounded-2xl bg-gradient-to-r from-emerald-50 dark:from-emerald-500/20 to-transparent border border-emerald-100 dark:border-emerald-500/20"></div>
                                        <div className="flex-1 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </FadeUp>
                </section>

                {/* Section 2: Role Switcher Showcase */}
                <section className="max-w-6xl mx-auto mb-40 pt-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Granular 4-Tier RBAC</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Instantly govern your platform with purpose-built environments for every user level.</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-10 items-stretch h-full">
                        {/* Left Controls */}
                        <div className="lg:w-1/3 flex flex-col gap-4">
                            {[
                                { id: "user", label: "User" },
                                { id: "editor", label: "Editor" },
                                { id: "author", label: "Author" },
                                { id: "admin", label: "Admin" }
                            ].map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => setActiveTab(role.id as keyof typeof roleData)}
                                    className={`text-left px-8 py-6 rounded-2xl border transition-all duration-300 ${activeTab === role.id ? 'bg-white dark:bg-emerald-500/10 border-emerald-500 shadow-xl dark:border-emerald-500/50 dark:shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)] scale-105 z-10' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                >
                                    <h3 className={`text-2xl font-bold mb-2 ${activeTab === role.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-300'}`}>{role.label}</h3>
                                    <p className={`text-sm ${activeTab === role.id ? 'text-emerald-600/80 dark:text-emerald-300/80' : 'text-gray-500'}`}>View the {role.label} experience</p>
                                </button>
                            ))}
                        </div>

                        {/* Right Display Area */}
                        <div className="lg:w-2/3 bg-white/70 dark:bg-black/40 shadow-xl dark:shadow-none backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] relative overflow-hidden min-h-[400px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 p-8 flex flex-col"
                                >
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-black mb-2 text-gray-900 dark:text-white">{roleData[activeTab].title}</h2>
                                        <p className="text-lg text-gray-600 dark:text-gray-400">{roleData[activeTab].desc}</p>
                                    </div>
                                    <div className="flex-1 bg-gray-50 dark:bg-black/50 rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-inner relative">
                                        {/* Glow effect */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 dark:bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                                        {roleData[activeTab].mock}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* Section 3: The Bento Grid */}
                <section className="max-w-6xl mx-auto mb-40">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Engineering Excellence</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400">Architected for security, scale, and seamless integrations.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[300px] md:auto-rows-[320px]">

                        {/* Box 1 (Large - Spans 2 cols) */}
                        <FadeUp delay={0.1} className="md:col-span-2 glass-card dark:glass-card-dark bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl dark:shadow-2xl hover:bg-white dark:hover:bg-white/10 transition-colors overflow-hidden relative group">
                            <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-100/50 dark:bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-200/50 dark:group-hover:bg-emerald-500/20 transition-all"></div>
                            <div className="relative z-10 w-full h-full flex flex-col justify-between">
                                <div>
                                    <FiShield className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mb-6" />
                                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Bulletproof Security</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-sm">JWT + Bcrypt + OAuth + OTP Grace Periods. A rigorous verification pipeline that guards your data at every entry point.</p>
                                </div>
                                {/* OTP Mockup visual */}
                                <div className="flex gap-3 justify-end mt-4">
                                    {[6, 9, 2, 4, 1, 8].map((num, i) => (
                                        <div key={i} className="w-10 h-10 bg-gray-50 dark:bg-black/50 border border-emerald-200 dark:border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl shadow-inner mix-blend-normal dark:mix-blend-screen">{num}</div>
                                    ))}
                                </div>
                            </div>
                        </FadeUp>

                        {/* Box 2 (Square) */}
                        <FadeUp delay={0.2} className="glass-card dark:glass-card-dark bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl dark:shadow-2xl hover:bg-white dark:hover:bg-white/10 transition-colors flex flex-col justify-between">
                            <div>
                                <FiRefreshCw className="w-10 h-10 text-cyan-500 dark:text-cyan-400 mb-6" />
                                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Google Engine</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Bi-Directional Sync. Built-in exponential backoff for flawless Calendar & Sheets integrations.</p>
                        </FadeUp>

                        {/* Box 3 (Square) */}
                        <FadeUp delay={0.3} className="glass-card dark:glass-card-dark bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl dark:shadow-2xl hover:bg-white dark:hover:bg-white/10 transition-colors flex flex-col justify-between">
                            <div>
                                <FiSettings className="w-10 h-10 text-purple-500 dark:text-purple-400 mb-6" />
                                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Governance Mode</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Global System Settings. Super-Admins define and orchestrate the overall platform role behaviors dynamically.</p>
                        </FadeUp>

                        {/* Box 4 (Large - Spans 2 cols) */}
                        <FadeUp delay={0.4} className="md:col-span-2 glass-card dark:glass-card-dark bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-black/20 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl dark:shadow-2xl hover:bg-white dark:hover:bg-white/10 transition-colors flex flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <FiArrowUpCircle className="w-10 h-10 text-blue-500 dark:text-blue-400 mb-4" />
                                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Role Requests Workflow</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">Automated Hierarchy Escalation. Users request permissions, Admins approve in real-time with push notifications.</p>
                                </div>
                                <div className="bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="w-10 h-10 shrink-0 bg-gray-200 dark:bg-white/10 rounded-full border border-gray-300 dark:border-white/20"></div>
                                        <div>
                                            <div className="text-gray-900 dark:text-white text-sm font-bold">John Doe</div>
                                            <div className="text-gray-500 text-xs">Requested 'Author' upgrade</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                                        <div className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-lg border border-emerald-200 dark:border-emerald-500/30 font-bold shrink-0">Approve</div>
                                        <div className="px-4 py-1.5 bg-gray-200 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs rounded-lg border border-gray-300 dark:border-white/10 font-bold shrink-0">Deny</div>
                                    </div>
                                </div>
                            </div>
                        </FadeUp>

                    </div>
                </section>

                {/* Section 4: Marquee */}
                <section className="mb-40 py-10 border-y border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md overflow-hidden flex whitespace-nowrap -mx-6 md:-mx-8 lg:mx-[calc(50%-50vw)] w-screen">
                    <motion.div
                        className="flex gap-16 px-8 items-center"
                        animate={{ x: [0, -1035] }} // roughly the width of one set
                        transition={{ ease: "linear", duration: 20, repeat: Infinity }}
                    >
                        {/* Needs to map twice for seamless loop */}
                        {[...marqueeItems, ...marqueeItems].map((item, i) => (
                            <span key={i} className="text-2xl font-bold text-gray-300 dark:text-white/30 hover:text-gray-900 dark:hover:text-white/80 transition-colors cursor-default dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                {item}
                            </span>
                        ))}
                    </motion.div>
                </section>

                {/* Section 5: Inside the Dashboard (Scroll Highlights) */}
                <section className="max-w-6xl mx-auto mb-40">
                    <div className="flex flex-col md:flex-row gap-20">
                        <div className="md:w-1/2 md:sticky top-40 h-fit space-y-16">
                            <div>
                                <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Inside the Architecture</h2>
                                <p className="text-xl text-gray-600 dark:text-gray-400">Deep dive into the modules that power productivity.</p>
                            </div>

                            <div className="space-y-12 pr-10">
                                <div className="border-l-2 border-emerald-500 pl-6">
                                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Calendar Integration</h3>
                                    <p className="text-gray-600 dark:text-gray-400">A strict 42-day normalized grid visualizing complex, multi-day spans seamlessly merged with Google APIs.</p>
                                </div>
                                <div className="border-l-2 border-gray-200 dark:border-white/10 pl-6 hover:border-gray-400 dark:hover:border-white/30 transition-colors duration-300">
                                    <h3 className="text-2xl font-bold mb-2 text-gray-500 dark:text-white/70">Kanban & Productivity</h3>
                                    <p className="text-gray-400 dark:text-gray-500">Interactive task tracking boards that trigger global app state updates and robust visual feedback loops.</p>
                                </div>
                                <div className="border-l-2 border-gray-200 dark:border-white/10 pl-6 hover:border-gray-400 dark:hover:border-white/30 transition-colors duration-300">
                                    <h3 className="text-2xl font-bold mb-2 text-gray-500 dark:text-white/70">Global Toast Notifications</h3>
                                    <p className="text-gray-400 dark:text-gray-500">A custom Singleton pattern powering non-blocking alerts across the entire frontend ecosystem reliably.</p>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-1/2 space-y-20">
                            {/* Visuals matching the text */}
                            <div className="h-[400px] bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl dark:shadow-2xl relative overflow-hidden flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">November</div>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10"></div>
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10"></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-2 mb-2">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-center text-xs text-gray-500 font-bold">{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-2 flex-1">
                                    {Array.from({ length: 35 }).map((_, i) => (
                                        <div key={i} className={`rounded-xl border border-gray-200 dark:border-white/5 flex items-start p-2 ${i === 15 ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/50' : 'bg-gray-50 dark:bg-white/5'}`}>
                                            <span className={`text-[10px] ${i === 15 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-500'}`}>{i + 1}</span>
                                            {i >= 15 && i <= 17 && (
                                                <div className="w-full h-1 mt-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)] dark:shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 6: Final CTA */}
                <section className="max-w-4xl mx-auto text-center mb-24 py-24 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-100/50 dark:via-emerald-500/5 to-transparent blur-3xl rounded-[100%] pointer-events-none"></div>
                    <FadeUp>
                        <h2 className="text-5xl md:text-6xl font-black mb-8 text-gray-900 dark:text-white">Ready to upgrade your system architecture?</h2>
                        <button onClick={() => navigate("/signup")} className="px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-black text-xl rounded-2xl font-black transition-all shadow-xl dark:shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 dark:hover:shadow-[0_0_80px_rgba(255,255,255,0.5)]">
                            Create Your Account
                        </button>
                    </FadeUp>
                </section>

            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md pt-16 pb-8 px-6 text-gray-500 dark:text-gray-400 transition-colors duration-500">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-white">A</div>
                            <span className="text-xl font-bold tracking-tight">AuthSystem</span>
                        </div>
                        <p className="text-sm max-w-xs text-center md:text-left">Production-grade infrastructure for modern web applications.</p>
                    </div>

                    <div className="flex gap-12 text-sm font-medium">
                        <div className="flex flex-col gap-3">
                            <a href="/login" className="hover:text-emerald-500 dark:hover:text-white transition-colors">Login</a>
                            <a href="/signup" className="hover:text-emerald-500 dark:hover:text-white transition-colors">Register</a>
                        </div>
                        <div className="flex flex-col gap-3">
                            <a href="/terms" className="hover:text-emerald-500 dark:hover:text-white transition-colors">Terms of Service</a>
                            <a href="/privacy" className="hover:text-emerald-500 dark:hover:text-white transition-colors">Privacy Policy</a>
                        </div>
                        <div className="flex flex-col gap-3">
                            <a href="#" className="hover:text-emerald-500 dark:hover:text-white transition-colors">GitHub Repository</a>
                            <a href="#" className="hover:text-emerald-500 dark:hover:text-white transition-colors">Documentation</a>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-200 dark:border-white/10 text-center text-sm">
                    © 2026 AuthSystem. Designed for scale.
                </div>
            </footer>
        </main>
    );
}
