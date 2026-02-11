import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWindows } from '../context/WindowContext';
import { useNotifications } from '../context/NotificationContext';
import ControlCenter from './ControlCenter';
import NotificationCenter from './NotificationCenter';
import Settings from './Settings';
import Terminal from './Terminal';
import ClockWidget from './ClockWidget';
import Profile from './Profile';

const TopBar: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [showFinderMenu, setShowFinderMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showClockWidget, setShowClockWidget] = useState(false);
  
  const finderMenuRef = useRef<HTMLDivElement>(null);
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const editMenuRef = useRef<HTMLDivElement>(null);
  const controlCenterRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const clockWidgetRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { addWindow } = useWindows();
  const { notifications } = useNotifications();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (finderMenuRef.current && !finderMenuRef.current.contains(event.target as Node)) {
        setShowFinderMenu(false);
      }
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
        setShowFileMenu(false);
      }
      if (editMenuRef.current && !editMenuRef.current.contains(event.target as Node)) {
        setShowEditMenu(false);
      }
      if (controlCenterRef.current && !controlCenterRef.current.contains(event.target as Node)) {
        setShowControlCenter(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (clockWidgetRef.current && !clockWidgetRef.current.contains(event.target as Node)) {
        setShowClockWidget(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('welcome_prompted');
    navigate('/login');
  };

  const handlePreferences = () => {
    setShowEditMenu(false);
    addWindow({
      title: 'System Settings',
      path: '/settings',
      component: <Settings />
    });
  };

  const handleOpenProfile = () => {
    setShowFileMenu(false);
    addWindow({
      title: 'Profile',
      path: '/profile',
      component: <Profile />
    });
  };

  const handleTerminalLaunch = () => {
    addWindow({
      title: 'Terminal',
      path: '/terminal',
      component: <Terminal />
    });
  };

  const userRole = localStorage.getItem('role') || sessionStorage.getItem('role');

  return (
    <div className="h-7 w-full macos-glass-dark fixed top-0 left-0 z-[100] flex items-center justify-between px-4 text-[13px] text-white/90 font-medium select-none">
      <div className="flex items-center space-x-4">
        {/* Finder Menu Trigger */}
        <div className="relative" ref={finderMenuRef}>
          <div 
            className={`flex items-center space-x-1 font-bold px-2 py-0.5 rounded cursor-default transition-colors ${showFinderMenu ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setShowFinderMenu(!showFinderMenu)}
          >
            <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
               <path d="M128,0C57.31,0,0,57.31,0,128s57.31,128,128,128,128-57.31,128-128S198.69,0,128,0z M128,232.44 c-57.58,0-104.44-46.86-104.44-104.44S70.42,23.56,128,23.56c57.58,0,104.44,46.86,104.44,104.44S185.58,232.44,128,232.44z" />
               <path d="M128,50c-43.08,0-78,34.92-78,78s34.92,78,78,78s78-34.92,78-78S171.08,50,128,50z M128,182.44 c-30.07,0-54.44-24.37-54.44-54.44S97.93,73.56,128,73.56s54.44,24.37,54.44,54.44S158.07,182.44,128,182.44z" />
            </svg>
            <span>Finder</span>
          </div>

          {/* macOS Style Dropdown Menu */}
          {showFinderMenu && (
            <div className="absolute top-7 left-0 w-56 macos-menu shadow-2xl rounded-md py-1 z-[110] border border-black/10 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
               <div className="px-3 py-1.5 hover:bg-white/10 cursor-default rounded-sm mx-1 transition-colors group">
                 <div className="flex justify-between items-center text-[13px]">
                   <span>About Finder</span>
                 </div>
               </div>
               <div className="h-[1px] bg-white/10 my-1 mx-1"></div>
               {userRole === 'admin' && (
                  <>
                    <div className="px-3 py-1.5 hover:bg-emerald-600 hover:text-white cursor-default rounded-sm mx-1 transition-colors group" onClick={() => { setShowFinderMenu(false); navigate('/admin/dashboard'); }}>
                      <div className="flex justify-between items-center text-[13px]">
                        <span>Admin Dashboard</span>
                      </div>
                    </div>
                    <div className="h-[1px] bg-white/10 my-1 mx-1"></div>
                  </>
                )}
               <div className="px-3 py-1.5 hover:bg-red-600 hover:text-white cursor-default rounded-sm mx-1 transition-colors group text-red-400 hover:text-white font-semibold" onClick={handleLogout}>
                 <div className="flex justify-items-start items-center space-x-2 text-[13px]">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                   </svg>
                   <span>Log Out User...</span>
                 </div>
               </div>
            </div>
          )}
        </div>

        <div className="relative" ref={fileMenuRef}>
          <div
            className={`px-2 py-0.5 rounded cursor-default transition-colors ${showFileMenu ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setShowFileMenu(!showFileMenu)}
          >
            File
          </div>

          {showFileMenu && (
            <div className="absolute top-7 left-0 w-56 macos-menu shadow-2xl rounded-md py-1 z-[110] border border-black/10 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-default rounded-sm mx-1 transition-colors group" onClick={handleOpenProfile}>
                <div className="flex justify-between items-center text-[13px]">
                  <span>Profile...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Edit Menu Trigger */}
        <div className="relative" ref={editMenuRef}>
          <div 
            className={`px-2 py-0.5 rounded cursor-default transition-colors ${showEditMenu ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={() => setShowEditMenu(!showEditMenu)}
          >
            Edit
          </div>

          {/* Edit Dropdown Menu */}
          {showEditMenu && (
            <div className="absolute top-7 left-0 w-56 macos-menu shadow-2xl rounded-md py-1 z-[110] border border-black/10 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
               <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-default rounded-sm mx-1 transition-colors group" onClick={handlePreferences}>
                 <div className="flex justify-between items-center text-[13px]">
                   <span>Preferences...</span>
                   <span className="text-[11px] opacity-60 group-hover:opacity-100">⌘,</span>
                 </div>
               </div>
            </div>
          )}
        </div>

        <div className="hover:bg-white/10 px-2 py-0.5 rounded cursor-default">View</div>
        <div className="hover:bg-white/10 px-2 py-0.5 rounded cursor-default">Go</div>
        <div 
          className="hover:bg-white/10 px-2 py-0.5 rounded cursor-default"
          onClick={handleTerminalLaunch}
        >
          Terminal
        </div>
        <div className="hover:bg-white/10 px-2 py-0.5 rounded cursor-default">Help</div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
           {/* Notification Center Trigger */}
           <div className="relative" ref={notificationsRef}>
            <div 
              className={`p-1 rounded cursor-default transition-colors relative ${showNotifications ? 'bg-white/20' : 'hover:bg-white/10'}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-black/20"></span>
              )}
            </div>

            {showNotifications && (
              <NotificationCenter />
            )}
           </div>
           
           {/* Control Center Trigger */}
           <div className="relative" ref={controlCenterRef}>
            <div 
              className={`p-1 rounded cursor-default transition-colors ${showControlCenter ? 'bg-white/20' : 'hover:bg-white/10'}`}
              onClick={() => setShowControlCenter(!showControlCenter)}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 9.5H3M21 4.5H3M21 14.5H3M21 19.5H3" strokeLinecap="round" />
                <circle cx="7" cy="9.5" r="1.5" fill="currentColor" />
                <circle cx="17" cy="4.5" r="1.5" fill="currentColor" />
                <circle cx="12" cy="14.5" r="1.5" fill="currentColor" />
                <circle cx="7" cy="19.5" r="1.5" fill="currentColor" />
              </svg>
            </div>

            {showControlCenter && (
              <ControlCenter />
            )}
           </div>

           <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
             <circle cx="11" cy="11" r="8" />
             <path d="M21 21l-4.35-4.35" />
           </svg>
          <div className="relative" ref={clockWidgetRef}>
            <div 
              className={`font-semibold cursor-default px-2 py-0.5 rounded transition-colors ${showClockWidget ? 'bg-white/20' : 'hover:bg-white/10'}`}
              onClick={() => setShowClockWidget(!showClockWidget)}
            >
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
            {showClockWidget && <ClockWidget />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
