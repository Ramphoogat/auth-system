import React, { useState, useRef, useEffect } from 'react';
import { type AppWindow as AppWindowType, useWindows } from '../context/WindowContext';

interface AppWindowProps {
  item: AppWindowType;
}

const AppWindow: React.FC<AppWindowProps> = ({ item }) => {
  const { closeWindow, setActiveWindowId, updateWindowPos, toggleMinimize, toggleMaximize } = useWindows();
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (item.maximized) return; // Prevent dragging while maximized
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    
    setIsDragging(true);
    setActiveWindowId(item.key);
    
    offsetRef.current = {
      x: e.clientX - item.x,
      y: e.clientY - item.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;
      
      updateWindowPos(item.key, newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, item.key, updateWindowPos]);

  if (item.minimized) return null;

  const windowStyles: React.CSSProperties = item.maximized 
    ? {
        width: '100%',
        height: 'calc(100% - 28px)', // Account for TopBar
        zIndex: item.zIndex,
        left: 0,
        top: 0,
        borderRadius: 0,
      }
    : {
        width: 800,
        height: 600,
        zIndex: item.zIndex,
        left: item.x,
        top: item.y,
      };

  return (
    <div 
      className={`absolute macos-glass shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden border border-white/30 flex flex-col transition-all duration-300 animate-in fade-in zoom-in-95 ${isDragging ? 'shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] scale-[1.005]' : ''}`}
      style={windowStyles}
      onClick={(e) => {
        e.stopPropagation();
        setActiveWindowId(item.key);
      }}
    >
      {/* Title Bar */}
      <div 
        className={`h-10 px-4 flex items-center justify-between select-none border-b border-black/5 ${item.maximized ? 'cursor-default' : 'cursor-default'} bg-white/10`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex space-x-2 window-controls">
            <div 
              className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] hover:brightness-90 cursor-default flex items-center justify-center group"
              onClick={(e) => { e.stopPropagation(); closeWindow(item.key); }}
            >
              <svg className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <div 
                className="w-3.5 h-3.5 rounded-full bg-[#FEBC2E] hover:brightness-90 cursor-default flex items-center justify-center group"
                onClick={(e) => { e.stopPropagation(); toggleMinimize(item.key); }}
            >
                 <svg className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M20 12H4" /></svg>
            </div>
            <div 
                className="w-3.5 h-3.5 rounded-full bg-[#28C840] hover:brightness-90 cursor-default flex items-center justify-center group"
                onClick={(e) => { e.stopPropagation(); toggleMaximize(item.key); }}
            >
                <svg className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M8 3v5h10V3M8 21v-5h10v5" /></svg>
            </div>
        </div>
        
        <span className="font-semibold text-[13px] text-gray-800/80 pointer-events-none">{item.title}</span>
        
        <div className="w-16"></div>
      </div>

      {/* Content Area */}
      <div className="flex-grow bg-white/60 backdrop-blur-md overflow-hidden text-gray-900">
        {item.component}
      </div>
    </div>
  );
};

export default AppWindow;
