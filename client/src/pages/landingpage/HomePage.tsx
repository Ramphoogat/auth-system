import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle";
import { FiArrowRight, FiShield, FiZap, FiLayout } from "react-icons/fi";
import { useTheme } from "../../context/themeContext";

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    useTheme();
    const isLoggedIn = !!(localStorage.getItem("token") || sessionStorage.getItem("token"));


    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <div className="font-display transition-colors duration-500 antialiased min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-70">
            </div>

            {/* Navbar */}
            <nav
                className={`fixed top-6 left-1/2 -translate-x-1/2 w-[95%] lg:w-[90%] max-w-7xl flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-xl bg-white/70 dark:bg-gray-950/50 border border-gray-200 dark:border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-3xl transition-all duration-500 z-50`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-emerald-500/20 ring-1 ring-white/20">
                        A
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight hidden md:block">AuthSystem</span>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {isLoggedIn ? (
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 transform active:scale-95"
                        >
                            Go to Dashboard <FiArrowRight />
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate("/login")}
                                className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-bold hover:text-emerald-500 dark:hover:text-emerald-500 transition-colors"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate("/signup")}
                                className="px-6 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-emerald-500 text-emerald-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-300 rounded-xl font-bold backdrop-blur-md transition-all duration-300 border border-transparent dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20"
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
                    The Future of Web Management
                </div>

                <h1 className="text-6xl md:text-[110px] font-black text-gray-900 dark:text-white tracking-tight mb-8 leading-[0.95] animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    Master Your <br />
                    <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">Digital Realm</span>
                </h1>

                <p className="text-gray-600 dark:text-gray-400 text-lg md:text-2xl max-w-3xl mb-24 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    The ultra-premium management platform for modern teams.
                    Experience control like never before with high-performance analytics and seamless workflows.
                </p>

                {/* Dashboard Preview Mockup */}
                <div className="w-full max-w-5xl mx-auto relative group animate-in fade-in slide-in-from-bottom-12 duration-1200 delay-500 perspective-1000">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-[3rem] blur-2xl opacity-10 dark:opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                    <div className="relative bg-white dark:bg-[#050505] rounded-[2.5rem] border border-gray-200 dark:border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all duration-700 hover:rotate-x-1">
                        {/* Browser Top Bar */}
                        <div className="flex items-center gap-2 px-8 py-5 bg-gray-50/50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400/40"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400/40"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400/40"></div>
                            </div>
                            <div className="mx-auto bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-full px-6 py-1.5 text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wide">
                                dashboard.authsystem.io/overview
                            </div>
                        </div>

                        {/* Mock Content */}
                        <div className="aspect-[16/10] bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-black p-8 flex flex-col gap-8">
                            <div className="grid grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-28 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.05] p-6 flex flex-col justify-between shadow-sm dark:shadow-none">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20"></div>
                                        <div className="w-2/3 h-3 rounded-full bg-gray-200 dark:bg-white/10"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 flex gap-6">
                                <div className="w-2/3 rounded-[2.5rem] bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.05] relative overflow-hidden p-8 shadow-sm dark:shadow-none">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <div className="w-32 h-5 rounded-full bg-gray-200 dark:bg-white/10 mb-2"></div>
                                            <div className="w-20 h-3 rounded-full bg-gray-100 dark:bg-white/5"></div>
                                        </div>
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5"></div>)}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-40 flex items-end px-12 gap-3">
                                        {[40, 60, 45, 90, 65, 80, 55, 75, 95, 85, 45, 70, 50, 60].map((h, i) => (
                                            <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500/40 to-emerald-500/10 dark:to-cyan-500/20 rounded-t-xl" style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 rounded-[2.5rem] bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.05] p-8 shadow-sm dark:shadow-none">
                                    <div className="space-y-6">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-white/10"></div>
                                                    <div className="w-1/2 h-2 rounded-full bg-gray-100 dark:bg-white/5"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40 w-full animate-in fade-in zoom-in duration-1000 delay-300">
                    {[
                        {
                            icon: <FiShield className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />,
                            title: "Secure Auth",
                            desc: "Enterprise-grade."
                        },
                        {
                            icon: <FiZap className="w-10 h-10 text-cyan-500 dark:text-cyan-400" />,
                            title: "Lightning Fast",
                            desc: ""
                        },
                        {
                            icon: <FiLayout className="w-10 h-10 text-purple-500 dark:text-purple-400" />,
                            title: "Stunning UI",
                            desc: "Glassmorphism"
                        }
                    ].map((feature, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-gray-200 dark:border-white/10 text-left hover:border-emerald-500/30 hover:scale-[1.03] hover:-translate-y-2 hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-500 group shadow-sm hover:shadow-xl dark:shadow-none">
                            <div className="mb-6">{feature.icon}</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
            {/*Footer Section*/}
            <footer className="relative z-10 pt-20 pb-10 border-t border-gray-200 dark:border-white/5 text-center px-6 transition-colors duration-500">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-900 dark:text-white font-black border border-gray-200 dark:border-white/10">A</div>
                        <span className="text-gray-900 dark:text-white font-bold">AuthSystem</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-600 text-sm">© 2026 AuthSystem. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
