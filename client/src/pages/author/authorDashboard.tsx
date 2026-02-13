import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiLogOut,
  FiActivity,
  FiLayout,
  FiBell,
  FiSearch,
  FiMenu,
  FiChevronsLeft,
  FiArrowUp,
  FiCheckCircle,
  FiX,
  FiMonitor,
  FiEdit, // Icon for Author
} from "react-icons/fi";
import DashboardSwitcher from "../../components/DashboardSwitcher";
import api from "../../api/axios";
import { AxiosError } from "axios";
import { BACKGROUNDS } from "../../constants/backgrounds";
import {
  SidebarItem,
  StatCard,
  ClientCard,
  AppearanceCard,
} from "./AuthorComponents";




interface IUser {
  _id: string;
  name?: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;

  createdAt: string;
}

interface IAdminStats {
  totalUsers: number;
  activeUsers: number;
  securityAlerts: number;
  systemUptime: string;
}

interface INotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const AuthorDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [authorName, setAuthorName] = useState("Author");
  const [authorEmail, setAuthorEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<IUser[]>([]);
  const [statsData, setStatsData] = useState<IAdminStats | null>(null);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [welcomeToast, setWelcomeToast] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    "Overview" | "Clients" | "Appearances"
  >("Overview"); // Removed Settings
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentBg, setCurrentBg] = useState(() => {
    return localStorage.getItem("author_dashboard_bg") || BACKGROUNDS.find(b => b.id === "silent")?.image || BACKGROUNDS[5].image; // Different default
  });
  const [showScrollButton] = useState(() => {
    const saved = localStorage.getItem("author_show_scroll_button");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAppliedToast, setShowAppliedToast] = useState(false);
  const mainContentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // First fetch profile to verify role
        const profileRes = await api.get("/auth/profile");
        const user = profileRes.data.user;

        const name = user.name || user.username;
        setAuthorName(name);
        setAuthorEmail(user.email);

        if (user.role !== "admin" && user.role !== "author") {
          setWelcomeToast({
            id: "error",
            message: "Access Denied: Author privileges required.",
          });
          navigate("/dashboard");
          return;
        }

        // Use the authenticated overview endpoint for deduplicated totals and sample users
        const overviewRes = await api.get("/auth/overview");
        setStatsData({
          totalUsers: overviewRes.data.totalUsers,
          activeUsers: overviewRes.data.activeUsers,
          securityAlerts: overviewRes.data.securityAlerts,
          systemUptime: overviewRes.data.systemUptime,
        });
        setUsers(overviewRes.data.users || []);

        // Add welcome notification
        const welcomeId = Date.now().toString();
        const welcomeMsg = `Welcome back, ${name}! Ready to create content?`;

        setNotifications([
          {
            id: welcomeId,
            title: "System",
            message: welcomeMsg,
            time: "Just now",
            isRead: false,
          },
        ]);

        // Show welcome toast for 3 seconds
        setWelcomeToast({ id: welcomeId, message: welcomeMsg });
        setTimeout(() => {
          setWelcomeToast(null);
        }, 3000);
      } catch (err: unknown) {
        const error = err as AxiosError;
        console.error("Failed to fetch dashboard data", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          navigate("/login");
        } else {
          setWelcomeToast({
            id: "error",
            message: "Failed to load dashboard data.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Refresh overview when a user role changes elsewhere (same-tab or other tabs)
  useEffect(() => {
    const refreshOverview = async () => {
      try {
        const overviewRes = await api.get("/auth/overview");
        setStatsData({
          totalUsers: overviewRes.data.totalUsers,
          activeUsers: overviewRes.data.activeUsers,
          securityAlerts: overviewRes.data.securityAlerts,
          systemUptime: overviewRes.data.systemUptime,
        });
        setUsers(overviewRes.data.users || []);
      } catch {
        // ignore failures here
      }
    };

    const onCustom = () => refreshOverview();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "userRoleChange") refreshOverview();
    };

    window.addEventListener("userRoleChanged", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("userRoleChanged", onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        setIsScrolled(mainContentRef.current.scrollTop > 100);
      }
    };

    const mainElement = mainContentRef.current;
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (mainElement) {
        mainElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    localStorage.setItem(
      "author_show_scroll_button",
      JSON.stringify(showScrollButton),
    );
  }, [showScrollButton]);

  const handleBgChange = (bgImage: string) => {
    setCurrentBg(bgImage);
    localStorage.setItem("author_dashboard_bg", bgImage);
    setShowAppliedToast(true);
    setTimeout(() => setShowAppliedToast(false), 3000);
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} mins ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return date.toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const stats = [
    {
      title: "Total Content Consumers",
      value: statsData?.totalUsers || "0",
      change: "+12%",
      icon: <FiUsers className="w-6 h-6" />,
    }, // Renamed from Total Users
    {
      title: "Active Readers",
      value: statsData?.activeUsers || "0",
      change: "+5%",
      icon: <FiActivity className="w-6 h-6" />,
    }, // Renamed from Active Sessions
    // Removed Security Alerts and System Uptime as they are "Admin" specific usually
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-black font-sans flex overflow-hidden bg-fixed bg-cover bg-center transition-all duration-700 ease-in-out"
      style={{ backgroundImage: `url(${currentBg})` }}
    >
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white/70 backdrop-blur-xl border-r border-white/20 transition-all duration-300 ease-in-out flex flex-col z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              AuthorPanel
            </h2>
          ) : (
            <FiEdit className="w-8 h-8 text-emerald-400" />
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-gray-100 text-gray-700 hover:text-black rounded-lg transition-all duration-300"
          >
            {isSidebarOpen ? (
              <FiChevronsLeft className="w-5 h-5" />
            ) : (
              <FiMenu className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem
            icon={<FiLayout />}
            label="Overview"
            active={activeTab === "Overview"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("Overview")}
          />

          <SidebarItem
            icon={<FiUsers />}
            label="Audience"
            active={activeTab === "Clients"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("Clients")}
          />

          <SidebarItem
            icon={<FiMonitor />}
            label="Appearances"
            active={activeTab === "Appearances"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("Appearances")}
          />
        </nav>

        <div className="p-4 border-t border-white/20">
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={`cursor-pointer group flex flex-col ${isSidebarOpen ? "px-2" : "items-center"} py-2 rounded-2xl transition-all duration-300 ${isProfileMenuOpen ? "bg-white/50 shadow-xl border border-white/30" : "hover:bg-white/20"}`}
          >
            {isProfileMenuOpen && (
              <div
                className={`w-full mb-3 space-y-1 ${isSidebarOpen ? "px-2" : "px-1"} pt-2 animate-in slide-in-from-bottom-2 duration-300`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className={`w-full flex items-center ${isSidebarOpen ? "px-3" : "justify-center"} py-2.5 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200 shadow-sm`}
                >
                  <FiLogOut className="w-4 h-4" />
                  {isSidebarOpen && (
                    <span className="ml-3 text-xs font-bold uppercase tracking-wider">
                      Sign Out
                    </span>
                  )}
                </button>
              </div>
            )}

            <div
              className={`flex items-center w-full ${isSidebarOpen ? "p-1" : "justify-center p-0.5"}`}
            >
              <div className="relative pointer-events-none p-0.5 bg-gradient-to-tr from-emerald-400 to-cyan-400 rounded-full shadow-md">
                <img
                  src={`https://unavatar.io/${encodeURIComponent(authorEmail)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}`}
                  alt="Author"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              </div>
              {isSidebarOpen && (
                <div className="ml-3 overflow-hidden flex-1 pointer-events-none">
                  <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                    {authorName}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                    Author
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        ref={mainContentRef}
        className="flex-1 overflow-y-auto bg-white/5 backdrop-blur-[2px] scroll-smooth custom-scrollbar-light"
      >
        <header className="h-20 bg-white/40 backdrop-blur-xl border-b border-white/20 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center bg-white/30 backdrop-blur-md rounded-full px-5 py-2 w-[450px] border border-white/20 shadow-sm transition-all focus-within:bg-white/50">
            <FiSearch className="text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search author dashboard..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder-slate-400 ml-3"
            />
          </div>

          <div className="flex items-center space-x-6">
            <DashboardSwitcher />
            <div className="relative">
              <button
                onClick={() =>
                  setShowNotificationDrawer(!showNotificationDrawer)
                }
                className={`relative p-2 ${showNotificationDrawer ? "text-black" : "text-gray-600"} hover:text-black transition-colors`}
              >
                <FiBell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[10px] flex items-center justify-center text-white font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotificationDrawer && (
                <div className="absolute right-0 mt-4 w-80 bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-white/20 flex justify-between items-center bg-white/30">
                    <h3 className="font-bold text-black">Notifications</h3>
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-gray-500 hover:text-black transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-4 border-b border-white/10 hover:bg-white/30 transition-colors group relative"
                        >
                          <p className="text-xs font-bold text-emerald-700 mb-1">
                            {n.title}
                          </p>
                          <p className="text-sm text-gray-800 pr-6">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-2">
                            {n.time}
                          </p>
                          <button
                            onClick={() => removeNotification(n.id)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <FiBell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">
                          No new notifications
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Welcome Toast */}
          {welcomeToast && (
            <div className="fixed top-24 right-8 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-white/40 backdrop-blur-xl border border-white/30 p-4 rounded-2xl shadow-2xl flex items-center space-x-4 max-w-sm">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <FiBell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-black text-sm">
                    System Update
                  </h4>
                  <p className="text-gray-700 text-xs">
                    {welcomeToast.message}
                  </p>
                </div>
                <button
                  onClick={() => setWelcomeToast(null)}
                  className="p-1 hover:bg-black/5 rounded-lg text-gray-500"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {activeTab === "Overview" ? (
            <>
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Welcome back, {authorName}
                </h1>
                <p className="text-slate-500 text-sm">
                  Overview of your content ecosystem.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <StatCard
                    key={i}
                    icon={stat.icon}
                    title={stat.title}
                    value={stat.value}
                    change={stat.change}
                  />
                ))}
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white/50 backdrop-blur-xl rounded-[32px] border border-white/30 shadow-xl overflow-hidden content-center">
                <div className="p-12 text-center">
                  <h3 className="text-lg font-bold text-slate-700">
                    Content Statistics
                  </h3>
                  <p className="text-slate-500">
                    Detailed content analytics coming soon.
                  </p>
                </div>
              </div>
            </>
          ) : activeTab === "Clients" ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    Audience Management
                  </h1>
                  <p className="text-slate-500 text-sm">
                    View your registered audience.
                  </p>
                </div>
                <div className="flex bg-white/40 backdrop-blur-md rounded-xl p-1 border border-white/30 shadow-sm">
                  <button className="px-4 py-2 text-xs font-bold bg-white/60 text-slate-800 rounded-lg shadow-sm">
                    All Readers
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.length > 0 ? (
                  users
                    .filter((u) => u.role !== "admin" && u.role !== "author")
                    .map((client) => (
                      <ClientCard
                        key={client._id}
                        client={client}
                        formatRelativeTime={formatRelativeTime}
                      />
                    ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white/30 backdrop-blur-md rounded-[32px] border border-white/20">
                    <FiUsers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">
                      No readers found in your database.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">
                  Appearances
                </h1>
                <p className="text-gray-600">
                  Personalize your workspace with a premium selection of
                  backgrounds.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {BACKGROUNDS.map((bg) => (
                  <AppearanceCard
                    key={bg.id}
                    bg={bg}
                    currentBg={currentBg}
                    handleBgChange={handleBgChange}
                  />
                ))}
              </div>

              {/* Scroll button settings removed to simplify */}
            </div>
          )}
        </div>

        {/* Floating Scroll Button */}
        {showScrollButton && (
          <button
            onClick={scrollToTop}
            className={`fixed bottom-10 right-10 p-5 bg-emerald-500 text-white rounded-2xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all duration-500 z-[60] hover:scale-110 active:scale-95 group border border-emerald-400/50 backdrop-blur-md hover:bg-emerald-400 ${
              isScrolled
                ? "opacity-100 translate-y-0 visible"
                : "opacity-0 translate-y-20 invisible pointer-events-none"
            }`}
          >
            <FiArrowUp className="w-6 h-6 group-hover:block transition-transform duration-300" />
            <div className="absolute -top-12 right-0 bg-black/80 text-white text-[10px] py-1 px-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-xl">
              Scroll To Top
            </div>
          </button>
        )}

        {/* Global Toast for BG Change */}
        {showAppliedToast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in zoom-in slide-in-from-bottom-5 duration-300">
            <div className="bg-white/70 backdrop-blur-2xl border border-white/40 px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-black">
                Theme matching applied successfully!
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};



export default AuthorDashboard;
