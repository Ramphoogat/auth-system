import React, { useMemo } from 'react';
import { useWindows } from '../context/WindowContext';

import Settings from './Settings';

const Dock: React.FC = () => {
  const { windows, addWindow, toggleMinimize } = useWindows();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dockApps = [
    { id: 'finder', label: 'Finder', iconPath: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', color: 'blue' },
    { id: 'safari', label: 'Safari', iconPath: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8', color: 'sky' },
    { id: 'mail', label: 'Mail', iconPath: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'indigo' },
    { id: 'notes', label: 'Notes', iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'yellow' },
    { id: 'settings', label: 'Settings', iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', color: 'gray' },
  ];

  const handleAppClick = (appId: string, label: string) => {
    const windowPath = `/${appId}`;
    const existingWindow = windows.find(w => w.path === windowPath);
    
    if (existingWindow) {
      if (existingWindow.minimized) {
        toggleMinimize(existingWindow.key);
      } else {
        toggleMinimize(existingWindow.key);
      }
    } else {
      let component = (
        <div className="flex items-center justify-center h-full">
           <h2 className="text-3xl font-light text-gray-400">Launch {label}...</h2>
        </div>
      );

      if (appId === 'settings') {
        component = <Settings />;
      }

      addWindow({
        title: label,
        path: windowPath,
        component
      });
    }
  };

  // Find windows that aren't in dockApps to show them as running (like Macintosh HD)
  const otherWindows = useMemo(() => {
    return windows.filter(w => !dockApps.some(da => `/${da.id}` === w.path));
  }, [dockApps, windows]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
      <div className="macos-glass-dark px-2 py-2 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/20 transition-all duration-300">
        {dockApps.map((app) => (
          <div
            key={app.id}
            className="group relative flex flex-col items-center"
            onClick={() => handleAppClick(app.id, app.label)}
          >
            <div className={`dock-item-animation w-12 h-12 rounded-[12px] flex items-center justify-center cursor-pointer shadow-lg bg-gradient-to-br from-white/10 to-transparent hover:bg-white/20 transition-all ${windows.some(w => w.path === `/${app.id}` && !w.minimized) ? 'saturate-150 brightness-110' : 'saturate-50 opacity-80'}`}>
               <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={app.iconPath} />
               </svg>
            </div>
            
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 macos-glass px-2 py-1 rounded-md text-[11px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
              {app.label}
            </div>

            {windows.some(w => w.path === `/${app.id}`) && (
               <div className="w-1 h-1 bg-white/80 rounded-full mt-1.5 shadow-[0_0_4px_white]"></div>
            )}
          </div>
        ))}
        
        {otherWindows.length > 0 && <div className="w-[1px] h-8 bg-white/20 mx-1"></div>}

        {otherWindows.map((win) => (
           <div
            key={win.key}
            className="group relative flex flex-col items-center"
            onClick={() => toggleMinimize(win.key)}
          >
            <div className={`dock-item-animation w-12 h-12 rounded-[12px] flex items-center justify-center cursor-pointer shadow-lg bg-white/10 hover:bg-white/20 transition-all ${!win.minimized ? 'saturate-150' : 'opacity-60'}`}>
               <div className="w-7 h-7 bg-blue-500/50 rounded flex items-center justify-center text-[10px] text-white font-bold overflow-hidden">
                 {win.title?.substring(0, 2).toUpperCase()}
               </div>
            </div>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 macos-glass px-2 py-1 rounded-md text-[11px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
              {win.title}
            </div>
            <div className="w-1 h-1 bg-white/80 rounded-full mt-1.5 shadow-[0_0_4px_white]"></div>
          </div>
        ))}

        <div className="w-[1px] h-8 bg-white/20 mx-1"></div>

        <div className="dock-item-animation w-12 h-12 rounded-[12px] flex items-center justify-center cursor-pointer text-white/80 hover:text-white">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
           </svg>
        </div>
      </div>
    </div>
  );
};

export default Dock;
