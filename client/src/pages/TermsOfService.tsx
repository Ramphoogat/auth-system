import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="font-display transition-colors duration-300 antialiased overflow-hidden">
            <main className="relative min-h-screen w-full flex items-center justify-center animated-bg p-4">
                <div className="glass-card w-full max-w-4xl p-10 rounded-3xl shadow-2xl relative z-10 h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-black">Terms of Service</h1>
                        <button 
                            onClick={() => navigate(-1)} 
                            className="text-gray-500 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                        </button>
                    </div>
                    
                    <div className="overflow-y-auto pr-4 space-y-6 text-gray-700 custom-scrollbar flex-grow">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
                            <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Use License</h2>
                            <p>Permission is granted to temporarily download one copy of the materials (information or software) on this website for personal, non-commercial transitory viewing only.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Disclaimer</h2>
                            <p>The materials on this website are provided "as is". We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Limitations</h2>
                            <p>In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this website.</p>
                        </section>
                        
                         <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Revisions and Errata</h2>
                            <p>The materials appearing on this website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its web site are accurate, complete, or current.</p>
                        </section>

                        <p className="text-sm text-gray-500 mt-8">Last updated: {new Date().getFullYear()}</p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <button 
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-emerald-600 text-green-500 font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary/30"
                        >
                            Close & Return
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TermsOfService;
