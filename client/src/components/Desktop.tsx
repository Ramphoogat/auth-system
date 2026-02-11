import React from 'react';
import { useWindows } from '../context/WindowContext';

const Desktop: React.FC = () => {
  const { addWindow } = useWindows();

  const openApp = () => {
    addWindow({
      title: 'About This System',
      path: '/about',
      component: (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 mb-6 relative">
             {/* Fancy logo effect */}
             <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
             <div className="relative w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">AgentOS</h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            A premium desktop environment built with React and Tailwind CSS. Featuring glassmorphism, 
            window management, and silky smooth transitions.
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
             {[
               { label: 'Processor', value: 'Google Gemini' },
               { label: 'Memory', value: '128 GB Unified' },
               { label: 'Storage', value: '2 TB SSD' },
               { label: 'Graphics', value: 'Neural Engine' }
             ].map(item => (
               <div key={item.label} className="bg-black/5 p-3 rounded-xl text-left border border-black/5">
                 <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{item.label}</div>
                 <div className="text-sm font-semibold text-gray-700">{item.value}</div>
               </div>
             ))}
          </div>
        </div>
      )
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none pt-12 pb-24 px-8">
      <div className="grid grid-cols-1 w-24 gap-8">
          <div 
            className="group flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/10 cursor-pointer pointer-events-auto transition-all active:scale-95"
            onDoubleClick={openApp}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-2 shadow-xl border border-white/40 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-transparent"></div>
                <svg className="w-9 h-9 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>
            <span className="text-[12px] font-medium text-white text-center leading-tight tracking-wide text-shadow-mac drop-shadow-md">Macintosh HD</span>
          </div>
      </div>
    </div>
  );
};

export default Desktop;
