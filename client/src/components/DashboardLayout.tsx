import React, { useState, useEffect, useRef } from "react";
import SidebarComponent from "./SidebarComponent";
import Navbar from "./Navbar";
import { type INotification } from "../pages/users/UsersComponents";



interface DashboardLayoutProps {
  title: string;
  sidebarItems: {
    icon: React.ReactNode;
    label: string;
    id: string;
  }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  userProfile: {
    name: string;
    email: string;
    username: string;
    role: string;
  };

  onLogout: () => void;
  onEditProfile: () => void;
  children: React.ReactNode;
  accentColor?: string; // 'emerald', 'blue', 'purple', etc.
  isScrollable?: boolean;
  notifications?: INotification[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  sidebarItems,
  activeTab,
  onTabChange,
  userProfile,
  onLogout,
  onEditProfile,
  children,
  accentColor = "emerald",
  isScrollable = true,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="h-screen font-sans flex overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300"
      onClick={() => setShowNotifications(false)}
    >
      <SidebarComponent
        title={title}
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        onTabChange={onTabChange}
        userProfile={userProfile}
        onLogout={onLogout}
        onEditProfile={onEditProfile}
        accentColor={accentColor}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden border-3 border-gray-200 dark:border-gray-700">
        <Navbar
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />

        {/* Scrollable Content */}
        <main
          ref={mainContentRef}
          className={`flex-1 ${isScrollable ? "overflow-y-auto custom-scrollbar-light" : "overflow-hidden"} bg-white/50 dark:bg-gray-900/50 p-4 lg:p-8 scroll-smooth`}
        >
          <div className={`${isScrollable ? "max-w-7xl mx-auto" : "h-full"}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
