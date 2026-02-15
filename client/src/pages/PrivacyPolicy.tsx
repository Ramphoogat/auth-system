import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="font-display transition-colors duration-300 antialiased overflow-hidden">
            <main className="relative min-h-screen w-full flex items-center justify-center animated-bg p-4">
                 <div className="glass-card w-full max-w-4xl p-10 rounded-3xl shadow-2xl relative z-10 h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-black">Privacy Policy</h1>
                        <button 
                            onClick={() => navigate(-1)} 
                            className="text-gray-500 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                        </button>
                    </div>  
                    
                    <div className="overflow-y-auto pr-4 space-y-1 text-gray-700  flex-grow">
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Information Collection</h2>
                            <p>We collect information you provide directly to us when you create an account, specifically your name, username, and email address.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Use of Information</h2>
                            <p>We use the information we collect to provide, maintain, and improve our services, including to process your transactions, manage your account, and communicate with you.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Data Security</h2>
                            <p>We implement appropriate technical and organizational measures to protect specific information you provide against unauthorized or unlawful processing and against accidental loss, destruction, or damage.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Cookies</h2>
                            <p>We may use cookies and similar tracking technologies to track the activity on our Service and hold certain information.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Third-Party Services</h2>
                            <p>We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information unless we provide users with advance notice.</p>
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

export default PrivacyPolicy;
