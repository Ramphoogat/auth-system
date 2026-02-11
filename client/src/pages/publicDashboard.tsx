import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WindowProvider, useWindows } from '../context/WindowContext';
import { NotificationProvider, useNotifications } from '../context/NotificationContext';
import TopBar from '../components/TopBar';
import TaskBar from '../components/TaskBar'; // This is actually our Dock now
import Desktop from '../components/Desktop';
import AppWindow from '../components/AppWindow';
import NotificationToast from '../components/NotificationToast';


const WindowRenderer = () => {
  const { windows } = useWindows();
  return (
    <>
      {windows.map((window) => (
        <AppWindow key={window.key} item={window} />
      ))}
    </>
  );
};

const DashboardContent: React.FC = () => {
  const { wallpaper } = useWindows();
  const { addNotification } = useNotifications();
  
  useEffect(() => {
    // Only show welcome message once on mount
    const hasPrompted = sessionStorage.getItem('welcome_prompted');
    if (!hasPrompted) {
      // Set immediately to prevent double-trigger in React Strict Mode
      sessionStorage.setItem('welcome_prompted', 'true');
      
      // Simulate getting username from token or state
      const username = localStorage.getItem('last_user') || 'User';
      
      setTimeout(() => {
        addNotification({
          title: 'Welcome Back!',
          message: `Hello ${username}, welcome to your premium workspace.`,
          type: 'success'
        });
      }, 1500); // Delay for better UX
    }
  }, [addNotification]);
  
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative font-sans select-none">
      {/* Pop-up Notifications (Toasts) */}
      <NotificationToast />

      {/* Background Image (MacOS Style) */}
      <div className="absolute inset-0 z-0">
         <img 
           src={`/src/assets/${wallpaper}`} 
           alt="Wallpaper" 
           className="w-full h-full object-cover transition-all duration-700 ease-in-out"
         />
         <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>
      
      {/* Top Menu Bar */}
      <TopBar />

      {/* Main Desktop Area */}
      <main className="flex-grow relative z-10 overflow-hidden mt-7">
        <Desktop />
        <WindowRenderer />
      </main>

      {/* Bottom Dock */}
      <TaskBar />
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    // Check if token exists, if not redirect to login
    if (!token) {
        // We'll allow viewing in development for now if not connected to server
        // console.warn('No token found, redirecting to login in production');
    }
  }, [token, navigate]);

  return (
    <NotificationProvider>
      <WindowProvider>
        <DashboardContent />
      </WindowProvider>
    </NotificationProvider>
  );
};

export default Dashboard;