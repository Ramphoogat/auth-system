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
      className="absolute top-14 right-0 w-[350px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden z-[110] border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-1 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-3">
          <h3 className="text-gray-900 dark:text-white font-bold text-sm">Notifications</h3>

          {notifications.length > 0 && (
            <span className="text-[11px] px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full">
              {notifications.length} New
            </span>
          )}
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Clear All
          </button>
        )}
      </div>


      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm italic">
            No new notifications
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group relative"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-gray-900 dark:text-gray-100 font-semibold text-[13px]">
                    {notif.title}
                  </span>
                  <span className="text-[10px] text-green-600 dark:text-green-400 mr-6">
                    {notif.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-[12px] leading-relaxed pr-6">
                  {notif.message}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notif.id);
                  }}
                  className="absolute right-4 top-8 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all"
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
