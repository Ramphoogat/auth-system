import React, { useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";

interface NotificationCenterProps {
  onClose?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { notifications, removeNotification, clearAll } = useNotifications();
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        if (onClose) onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={notificationRef}
      className="absolute top-8 right-0 w-[350px] macos-glass-dark rounded-2xl shadow-2xl overflow-hidden z-[110] border border-white/10 animate-in fade-in slide-in-from-top-1 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
        <h3 className="text-white font-bold text-sm">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-sm italic">
            No new notifications
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 hover:bg-white/5 transition-colors group relative"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-white font-semibold text-[13px]">
                    {notif.title}
                  </span>
                  <span className="text-[10px] text-white/30">
                    {notif.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-white/70 text-[12px] leading-relaxed pr-6">
                  {notif.message}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notif.id);
                  }}
                  className="absolute right-4 top-4 p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  aria-label="Remove notification"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
