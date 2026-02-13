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
  FiCheckCircle,
  FiX,
  FiMonitor,
} from "react-icons/fi";
import DashboardSwitcher from "../../components/DashboardSwitcher";
import api from "../../api/axios";
import { AxiosError } from "axios";
import { BACKGROUNDS } from "../../constants/backgrounds";
import {
  SidebarItem,
  StatCard,
  AppearanceCard,
} from "./UsersComponents";




interface INotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface IUser {
  _id: string;
  name?: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [welcomeToast, setWelcomeToast] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    "Overview" | "Appearances" | "Users"
  >("Overview");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentBg, setCurrentBg] = useState(() => {
    return localStorage.getItem("user_dashboard_bg") || BACKGROUNDS[0].image; // macOS default for users
  });
  const [showScrollButton] = useState(() => {
    const saved = localStorage.getItem("user_show_scroll_button");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [, setIsScrolled] = useState(false);
  const [showAppliedToast, setShowAppliedToast] = useState(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const mainContentRef = React.useRef<HTMLDivElement>(null);
  const previousRole = React.useRef<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // First fetch profile to verify role
        const profileRes = await api.get("/auth/profile");
        const user = profileRes.data.user;
        previousRole.current = user.role;

        const name = user.name || user.username;
        setUserName(name);
        setUserEmail(user.email);

        // This is the UserDashboard - fetch overview (safe, authenticated) to show totals/sample users
        try {
          const overviewRes = await api.get("/auth/overview");

          if (overviewRes?.data) {
            const total = overviewRes.data.totalUsers;
            const welcomeMsg = `Welcome back, ${name}! ${total} users in the system.`;
            setNotifications([
              {
                id: Date.now().toString(),
                title: "System",
                message: welcomeMsg,
                time: "Just now",
                isRead: false,
              },
            ]);
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // ignore overview errors for regular users
        }

        // Add welcome notification (already set above when overview fetch succeeds)
        const welcomeId = Date.now().toString();
        const welcomeMsg = `Welcome back, ${name}!`;

        setNotifications([
          {
            id: welcomeId,
            title: "System",
            message: welcomeMsg,
            time: "Just now",
            isRead: false,
          },
        ]);

        setWelcomeToast({ id: welcomeId, message: welcomeMsg });
        setTimeout(() => setWelcomeToast(null), 3000);
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

  // ... Scroll & BG effects (Review for brevity, copy same logic)
  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current)
        setIsScrolled(mainContentRef.current.scrollTop > 100);
    };
    const el = mainContentRef.current;
    if (el) el.addEventListener("scroll", handleScroll);
    return () => el?.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(
    () =>
      localStorage.setItem(
        "user_show_scroll_button",
        JSON.stringify(showScrollButton),
      ),
    [showScrollButton],
  );

  const handleBgChange = (bgImage: string) => {
    setCurrentBg(bgImage);
    localStorage.setItem("user_dashboard_bg", bgImage);
    setShowAppliedToast(true);
    setTimeout(() => setShowAppliedToast(false), 3000);
  };

  useEffect(() => {
    if (activeTab === "Users") {
      const fetchUsers = async () => {
        try {
          const res = await api.get("/auth/users");
          setUsers(res.data.users);
        } catch (error) {
          console.error("Failed to fetch users", error);
        }
      };
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await api.get("/auth/profile");
        const role = res.data.user.role;

        // Initialize if not set
        if (previousRole.current === null) {
          previousRole.current = role;
          return;
        }

        // Only redirect if role has CHANGED
        if (role && role !== previousRole.current) {
          previousRole.current = role;

          if (role !== "user") {
            let path = "/dashboard";
            if (role === "admin") path = "/admin/dashboard";
            else if (role === "editor") path = "/editor/dashboard";
            else if (role === "author") path = "/author/dashboard";
            navigate(path);
          }
        }
      } catch {
        // quiet fail
      }
    };
    const interval = setInterval(checkRole, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const removeNotification = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  const clearAllNotifications = () => setNotifications([]);

  const stats = [
    {
      title: "Your Profile",
      value: "Active",
      change: "",
      icon: <FiUsers className="w-6 h-6" />,
    },
    {
      title: "Dashboard Access",
      value: "Enabled",
      change: "",
      icon: <FiActivity className="w-6 h-6" />,
    },
  ];

  const refreshOverview = async () => {
    try {
      const overviewRes = await api.get("/auth/overview");
      // update local state: stats, users, or profile as needed
      setStatsData({
        totalUsers: overviewRes.data.totalUsers,
        activeUsers: overviewRes.data.activeUsers,
        securityAlerts: overviewRes.data.securityAlerts,
        systemUptime: overviewRes.data.systemUptime,
      });
      // if you surface sample users:
      setUsers(overviewRes.data.users || []);
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error("Failed to fetch overview data", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/login");
      } else {
        setWelcomeToast({
          id: "error",
          message: "Failed to load overview data.",
        });
      }
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onCustom = () => {
    // same-tab event
    refreshOverview();
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onStorage = (e: StorageEvent) => {
    if (e.key === "userRoleChange") refreshOverview();
  };

  useEffect(() => {
    window.addEventListener("userRoleChanged", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("userRoleChanged", onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, [onCustom, onStorage]);

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
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              UserPanel
            </h2>
          ) : (
            <FiLayout className="w-8 h-8 text-blue-400" />
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
            label="Users"
            active={activeTab === "Users"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("Users")}
          />
          <SidebarItem
            icon={<FiMonitor />}
            label="Appearances"
            active={activeTab === "Appearances"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("Appearances")}
          />
        </nav>

        {/* Profile Footer */}
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
              <div className="relative pointer-events-none p-0.5 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full shadow-md">
                <img
                  src={`https://unavatar.io/${encodeURIComponent(userEmail)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`}
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              </div>
              {isSidebarOpen && (
                <div className="ml-3 overflow-hidden flex-1 pointer-events-none">
                  <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                    {userName}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                    User
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
          {/* Search & notification same as others */}
          <div className="flex items-center bg-white/30 backdrop-blur-md rounded-full px-5 py-2 w-[450px] border border-white/20 shadow-sm transition-all focus-within:bg-white/50">
            <FiSearch className="text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
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
                  Welcome back, {userName}
                </h1>
                <p className="text-slate-500 text-sm">
                  Your personal dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="bg-white/50 backdrop-blur-xl rounded-[32px] border border-white/30 shadow-xl overflow-hidden content-center mt-8">
                <div className="p-12 text-center">
                  <h3 className="text-lg font-bold text-slate-700">
                    Quick Actions
                  </h3>
                  <p className="text-slate-500">
                    Your dashboard features are coming soon.
                  </p>
                </div>
              </div>
            </>
          ) : activeTab === "Users" ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-black mb-2">
                    Community
                  </h1>
                  <p className="text-gray-600">
                    Connect with other members of the platform.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["all", "admin", "author", "editor", "user"].map((role) => (
                    <button
                      key={role}
                      onClick={() => setRoleFilter(role)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
                        roleFilter === role
                          ? "bg-blue-500 text-white border-blue-400 shadow-lg scale-105"
                          : "bg-white/40 text-slate-600 border-white/30 hover:bg-white/60 hover:text-slate-800 hover:scale-105"
                      }`}
                    >
                      {role === "all" ? "All Roles" : role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-xl rounded-[32px] border border-white/30 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/20 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users
                        .filter(
                          (user) =>
                            roleFilter === "all" || user.role === roleFilter,
                        )
                        .map((user) => (
                          <tr
                            key={user._id}
                            className="hover:bg-white/20 transition-colors"
                          >
                            <td className="px-6 py-4 flex items-center">
                              <img
                                src={`https://unavatar.io/${encodeURIComponent(
                                  user.email,
                                )}`}
                                className="w-8 h-8 rounded-full mr-3 border border-white/30"
                                alt=""
                              />
                              <div>
                                <div className="font-bold text-slate-800 text-sm">
                                  {user.name || user.username}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {user.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                  user.role === "admin"
                                    ? "bg-purple-500/10 text-purple-600 border-purple-200/30"
                                    : "bg-slate-500/10 text-slate-600 border-slate-200/30"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-slate-600">
                              {user.isVerified ? (
                                <span className="flex items-center text-emerald-600">
                                  <FiCheckCircle className="mr-1 w-3 h-3" />{" "}
                                  Verified
                                </span>
                              ) : (
                                "Pending"
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      {users.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-8 text-center text-slate-500"
                          >
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-bold text-black mb-2">
                Appearances
              </h1>
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
            </div>
          )}
        </div>
        {/* Scroll button & Toast omitted for brevity but logic exists in previous effects */}
        {showAppliedToast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in zoom-in slide-in-from-bottom-5 duration-300">
            <div className="bg-white/70 backdrop-blur-2xl border border-white/40 px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3">
              <span className="font-bold text-sm text-black">
                Theme applied!
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};



export default UserDashboard;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setStatsData(_arg0: {
  totalUsers: unknown;
  activeUsers: unknown;
  securityAlerts: unknown;
  systemUptime: unknown;
}) {
  throw new Error("Function not implemented.");
}
