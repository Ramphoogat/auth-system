import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  message, 
  type = 'info', 
  duration = 3000,
  onClose 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500/90',
          icon: <FiCheckCircle className="w-5 h-5" />,
          iconBg: 'bg-emerald-600',
        };
      case 'error':
        return {
          bg: 'bg-red-500/90',
          icon: <FiAlertCircle className="w-5 h-5" />,
          iconBg: 'bg-red-600',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/90',
          icon: <FiAlertCircle className="w-5 h-5" />,
          iconBg: 'bg-amber-600',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500/90',
          icon: <FiInfo className="w-5 h-5" />,
          iconBg: 'bg-blue-600',
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div 
      className={`${styles.bg} backdrop-blur-xl text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 min-w-[320px] max-w-md animate-in slide-in-from-right-full fade-in duration-300 border border-white/20`}
    >
      <div className={`${styles.iconBg} p-2 rounded-xl flex-shrink-0`}>
        {styles.icon}
      </div>
      <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
