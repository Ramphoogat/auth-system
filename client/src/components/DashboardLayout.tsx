import React, { useState, useEffect, useRef } from "react";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiBell,
  FiSearch,
  FiEdit,
  FiChevronLeft,
} from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";
import DashboardSwitcher from "./DashboardSwitcher";
import NotificationCenter from "./NotificationCenter";
import { useNotifications } from "../context/NotificationContext";

export interface INotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  isSidebarOpen: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active,
  isSidebarOpen,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center h-10 px-2 py-2 rounded-2xl transition-all duration-300 group ${active
      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-emerald-500"
      }`}
    title={!isSidebarOpen ? label : ""}
  >
    <div className="w-5 h-5 flex items-center justify-center shrink-0">
      <div
        className={`transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`}
      >
        {icon}
      </div>
    </div>
    {isSidebarOpen && (
      <span
        className={`ml-4 font-semibold text-sm tracking-wide truncate overflow-hidden transition-all duration-200 ${isSidebarOpen
          ? "max-w-[160px] opacity-100 translate-x-0"
          : "max-w-0 opacity-0 -translate-x-1 pointer-events-none"
          }`}
      >
        {label}
      </span>
    )}
  </button>
);

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
  notifications: INotification[];
  onLogout: () => void;
  onEditProfile: () => void;
  children: React.ReactNode;
  accentColor?: string; // 'emerald', 'blue', 'purple', etc.
  isScrollable?: boolean;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // with line 141, this will auto-close on smaller screens
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { notifications: contextNotifications } = useNotifications();

  const accentClass =
    {
      emerald: "from-emerald-500 to-cyan-500",
      blue: "from-blue-500 to-indigo-500",
      purple: "from-purple-500 to-pink-500",
    }[accentColor as "emerald" | "blue" | "purple"] ||
    "from-emerald-500 to-cyan-500";

  const accentShadow =
    {
      emerald: "shadow-emerald-500/20",
      blue: "shadow-blue-500/20",
      purple: "shadow-purple-500/20",
    }[accentColor as "emerald" | "blue" | "purple"] || "shadow-emerald-500/20";

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
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-gray-800 transition-all duration-500 ease-in-out z-40 relative ${isSidebarOpen ? "w-60" : "w-24"
          }`}
      >
        {/* Custom Border Line */}
        <div className="absolute top-0 right-0 h-full w-px bg-gray-200 dark:bg-gray-700 z-10"></div>

        {/* Curved Cut / Mask for Button - Hides the straight line behind button */}
        <div className="absolute -right-[1px] top-8 w-6 h-9 bg-white dark:bg-gray-800 z-20"></div>
        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute -right-4 top-8 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-[60] text-gray-400 hover:text-emerald-500 transition-all duration-300 group`}
        >
          <FiChevronLeft
            className={`w-5 h-5 transition-transform duration-500 ${!isSidebarOpen && "rotate-180"}`}
          />

        </button>

        <div className={`h-20 lg:h-24 px-6 flex ${isSidebarOpen ? "items-center justify-start" : "items-center justify-center"} border-b border-gray-200 dark:border-gray-800 transition-all duration-300`}>
          {isSidebarOpen ? (
            <h2 className={`text-xl font-black bg-gradient-to-r ${accentClass} bg-clip-text text-transparent truncate animate-in fade-in slide-in-from-left-2 duration-500 pr-4`}>
              {title}
            </h2>
          ) : (
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accentClass} flex items-center justify-center text-white shadow-lg ${accentShadow} font-black text-xl flex-shrink-0 animate-in zoom-in duration-500`}>
              {title.charAt(0)}
            </div>
          )}
        </div>
        <nav className="flex-1 pl-4 pr-4 lg:pl-8 lg:pr-6 space-y-2 mt-4 overflow-y-auto no-scrollbar">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              isSidebarOpen={isSidebarOpen}
              onClick={() => onTabChange(item.id)}
            />
          ))}
        </nav>

        {/* User Card in Sidebar */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={`cursor-pointer group relative flex flex-col p-2 rounded-2xl transition-all duration-300 ${isProfileMenuOpen ? "bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}
          >
            {isProfileMenuOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-2 animate-in slide-in-from-bottom-2 duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditProfile();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 rounded-xl transition-all"
                >
                  <FiEdit className="mr-3" /> Edit Profile
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <FiLogOut className="mr-3" /> Sign Out
                </button>
              </div>
            )}
            <div
              className={`flex items-center ${!isSidebarOpen ? "justify-center" : ""}`}
            >
              <img
                src={`https://unavatar.io/${encodeURIComponent(userProfile.email)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}`}
                className="w-10 h-10 rounded-xl border-2 border-white dark:border-gray-700 shadow-sm object-cover flex-shrink-0"
                alt="Avatar"
              />
              {isSidebarOpen && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-bold truncate text-gray-800 dark:text-gray-100">
                    {userProfile.name}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                    {userProfile.role}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile/Tablet Drawer */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 shadow-2xl transition-transform duration-500 ease-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
            <h2
              className={`text-xl font-bold bg-gradient-to-r ${accentClass} bg-clip-text text-transparent`}
            >
              {title}
            </h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                isSidebarOpen={isSidebarOpen} // This prop won't affect the mobile drawer, but we can keep it consistent
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
              />
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center mb-4">
              <img
                src={`https://unavatar.io/${encodeURIComponent(userProfile.email)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}`}
                className="w-12 h-12 rounded-full border-2 border-emerald-500 shadow-md"
                alt="Avatar"
              />
              <div className="ml-3">
                <p className="text-sm font-bold">{userProfile.name}</p>
                <p className="text-xs text-gray-500">{userProfile.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onEditProfile}
                className="flex items-center justify-center p-2 text-xs font-bold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50"
              >
                <FiEdit className="mr-2" /> Edit
              </button>
              <button
                onClick={onLogout}
                className="flex items-center justify-center p-2 text-xs font-bold bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
              >
                <FiLogOut className="mr-2" /> Exit
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden border-1 border-gray-200 dark:border-gray-700">
        {/* Header */}
        <header className="h-20 lg:h-24 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-900/50 rounded-2xl px-4 py-2 w-48 md:w-64 lg:w-96 border border-transparent focus-within:border-emerald-500/50 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all shadow-inner">
              <FiSearch className="text-gray-400 w-4 h-4 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-full ml-3 text-gray-700 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="flex items-center space-x-1 md:space-x-3 lg:space-x-6">
            <div className="block">
              <DashboardSwitcher />
            </div>
            <div className="scale-90 sm:scale-100">
              <ThemeToggle />
            </div>
            {/* Notification Bell Starts here */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                className={`p-2 rounded-xl transition-all ${showNotifications ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              >
                <div className="relative">
                  <FiBell className="w-6 h-6" />
                  {contextNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                      {contextNotifications.length}
                    </span>
                  )}
                </div>
              </button>
              {/* Notification Bell Ends here */}
              {showNotifications && (
                <NotificationCenter onClose={() => setShowNotifications(false)} />
              )}

            </div>
          </div>
        </header>

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
