import React, { useState } from 'react';


const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'notifications' | 'sound' | 'about'>('appearance');

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'appearance', label: 'Appearance', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },

    { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'sound', label: 'Sound', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' },
    { id: 'about', label: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  const renderContent = () => {
    switch (activeTab) {

      case 'appearance':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Appearance</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="w-full aspect-[4/3] bg-white border-4 border-blue-500 rounded-xl shadow-sm flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg"></div>
                </div>
                <span className="text-sm font-medium text-gray-700">Light Mode</span>
              </div>
              <div className="flex flex-col items-center gap-3 opacity-60">
                <div className="w-full aspect-[4/3] bg-gray-900 border-4 border-transparent rounded-xl shadow-sm flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg"></div>
                </div>
                <span className="text-sm font-medium text-gray-700">Dark Mode</span>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Accent Color</h3>
              <div className="flex gap-4">
                {['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500', 'bg-green-500'].map((color) => (
                  <div key={color} className={`w-6 h-6 rounded-full ${color} cursor-pointer ring-offset-2 hover:ring-2 ring-gray-300 transition-all`}></div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Notifications</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div>
                  <h3 className="font-medium text-gray-800">Notification Center</h3>
                  <p className="text-xs text-gray-500">Show notifications in top-right menu</p>
                </div>
                <div className="w-10 h-5 bg-blue-500 rounded-full flex items-center px-1">
                  <div className="w-3 h-3 bg-white rounded-full ml-auto"></div>
                </div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div>
                  <h3 className="font-medium text-gray-800">Sound Effects</h3>
                  <p className="text-xs text-gray-500">Play sounds for system events</p>
                </div>
                <div className="w-10 h-5 bg-gray-300 rounded-full flex items-center px-1">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8 flex items-center justify-center h-full">
            <span className="text-gray-400">Coming soon in next update...</span>
          </div>
        )
    }
  };

  return (
    <div className="flex h-full bg-white text-gray-800 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50/50 border-r border-gray-200 p-4 flex flex-col pt-8">
        <h1 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-4 mb-6">Settings</h1>
        <div className="space-y-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all ${activeTab === tab.id ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-200 text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span className="text-sm font-medium">{tab.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-[11px] text-blue-600 font-bold mb-1">PRO TIP</p>
          <p className="text-[10px] text-blue-400 leading-tight italic">You can also access some settings from the Control Center in the top bar.</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default Settings;
