import React, { useEffect, useState } from 'react';
import { useNotifications, type Notification } from '../context/NotificationContext';

const NotificationToast: React.FC = () => {
  const { notifications } = useNotifications();
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  useEffect(() => {
    // When a new notification arrives, show it as a toast if it's the latest one
    if (notifications.length > 0) {
      const latest = notifications[0];
      // Only show if it's "new" (less than 5 seconds old)
      if (new Date().getTime() - latest.timestamp.getTime() < 1000) {
        setActiveToast(latest);
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 4000); // 4 seconds total (1s fade in/steady + 3s display)
        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  if (!activeToast) return null;

  return (
    <div className="fixed top-10 right-4 z-[200] animate-in fade-in slide-in-from-right-10 duration-500">
      <div className="macos-glass-dark w-[300px] p-4 rounded-2xl shadow-2xl border border-white/20 flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-white font-bold text-[13px]">{activeToast.title}</span>
          </div>
          <button 
            onClick={() => setActiveToast(null)}
            className="text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-white/80 text-[12px] leading-snug">
          {activeToast.message}
        </p>
      </div>
    </div>
  );
};

export default NotificationToast;
