import React, { createContext, useContext, useState, useCallback } from 'react';

// Define the shape of a Window
export interface AppWindow {
  key: string;
  zIndex: number;
  path: string;
  x: number;
  y: number;
  minimized: boolean;
  maximized: boolean;
  title?: string;
  component?: React.ReactNode;
  icon?: string;
}

interface WindowContextType {
  windows: AppWindow[];
  wallpaper: string;
  setWallpaper: (path: string) => void;
  addWindow: (app: Partial<AppWindow>) => void;
  updateWindowPos: (key: string, x: number, y: number) => void;
  toggleMinimize: (key: string) => void;
  toggleMaximize: (key: string) => void;
  closeWindow: (key: string) => void;
  activeWindowId: string | null;
  setActiveWindowId: (id: string | null) => void;
}

const WindowContext = createContext<WindowContextType | null>(null);

export const WindowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [wallpaper, setWallpaper] = useState<string>('MacOS.jpg');

  const addWindow = useCallback((app: Partial<AppWindow>) => {
    setWindows(prev => {
      const existing = app.path ? prev.find(w => w.path === app.path) : null;
      
      if (existing) {
        setActiveWindowId(existing.key);
        return prev.map(w => w.key === existing.key ? { ...w, minimized: false, zIndex: Math.max(...prev.map(p => p.zIndex), 0) + 1 } : w);
      }

      const newWindow: AppWindow = {
        key: Math.random().toString(36).substr(2, 9),
        zIndex: prev.length > 0 ? Math.max(...prev.map(w => w.zIndex)) + 1 : 100,
        x: 100 + (prev.length * 30),
        y: 100 + (prev.length * 30),
        minimized: false,
        maximized: false,
        path: app.path || '',
        title: app.title || 'Untitled', 
        component: app.component || null,
        ...app
      } as AppWindow;
      
      setActiveWindowId(newWindow.key);
      return [...prev, newWindow];
    });
  }, []);

  const updateWindowPos = useCallback((key: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.key === key ? { ...w, x, y } : w));
  }, []);

  const toggleMinimize = useCallback((key: string) => {
    setWindows(prev => {
      const updated = prev.map(w => w.key === key ? { ...w, minimized: !w.minimized } : w);
      // If we just unminimized, make it active
      const target = updated.find(w => w.key === key);
      if (target && !target.minimized) {
        setActiveWindowId(key);
      } else if (activeWindowId === key) {
        setActiveWindowId(null);
      }
      return updated;
    });
  }, [activeWindowId]);

  const toggleMaximize = useCallback((key: string) => {
    setWindows(prev => prev.map(w => w.key === key ? { ...w, maximized: !w.maximized } : w));
  }, []);

  const closeWindow = useCallback((key: string) => {
    setWindows(prev => prev.filter(w => w.key !== key));
    if (activeWindowId === key) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  return (
    <WindowContext.Provider value={{ 
      windows, 
      wallpaper,
      setWallpaper,
      addWindow, 
      updateWindowPos, 
      toggleMinimize, 
      toggleMaximize, 
      closeWindow, 
      activeWindowId, 
      setActiveWindowId 
    }}>
      {children}
    </WindowContext.Provider>
  );
};

export const useWindows = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindows must be used within a WindowProvider');
  }
  return context;
};
