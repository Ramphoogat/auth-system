import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newNotification: Notification = {
      ...notif,
      id,
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);

    // Auto-remove after 3 seconds for the "pop-up" effect
    // Note: We keep them in the list, but we might want a separate state for "active toasts"
    // For now, let's keep them in the list and handle the toast visibility separately or just use this.
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
