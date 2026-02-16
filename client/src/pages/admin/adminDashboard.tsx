import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiUsers,
  FiSettings,
  FiActivity,
  FiShield,
  FiLayout,
} from "react-icons/fi";

import api from "../../api/axios";
import { AxiosError } from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import ProfileEditModal from "../../components/ProfileEditModal";
import Settings from "./Settings";
import { useToast } from "../../components/ToastProvider";
import { useNotifications } from "../../context/NotificationContext";
import { FiChevronDown } from "react-icons/fi";
import {
  UserManagementRow,
  type IUser,
  type IAdminStats,
  type INotification,
} from "./AdminComponents";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const { showSuccess, showError, showInfo } = useToast();
  const { addNotification } = useNotifications();
  const [adminName, setAdminName] = useState("Admin");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<IUser[]>([]);
  const [statsData, setStatsData] = useState<IAdminStats | null>(null);
  const [notifications] = useState<INotification[]>([]);
  const [activeTab, setActiveTab] = useState<
    "Overview" | "UserManagement" | "Settings"
  >("Overview");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // eslint-disable-next-line no-empty-pattern
  const [] = useState(() => {
    const saved = localStorage.getItem("admin_show_scroll_button");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [roleFilter, setRoleFilter] = useState("all");
  const [governanceMode, setGovernanceMode] = useState<string>("MODE_1");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const profileRes = await api.get("/auth/profile");
        const user = profileRes.data.user;

        const name = user.name || user.username;
        setAdminName(name);
        setAdminUsername(user.username);
        setAdminEmail(user.email);

        if (user.role !== "admin") {
          showError("Access Denied: Administrator privileges required.");
          navigate("/dashboard");
          return;
        }

        const overviewRes = await api.get("/auth/overview");
        setStatsData({
          totalUsers: overviewRes.data.totalUsers,
          activeUsers: overviewRes.data.activeUsers,
          securityAlerts: overviewRes.data.securityAlerts,
          systemUptime: overviewRes.data.systemUptime,
        });

        const usersRes = await api.get("/auth/admin/users");
        let allUsers: IUser[] = usersRes.data.users || [];

        // Identify and filter out the 1st admin (earliest createdAt) so they are hidden/protected
        const admins = allUsers.filter(u => u.role === 'admin')
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        if (admins.length > 0) {
          const firstAdminId = admins[0]._id;
          allUsers = allUsers.filter(u => u._id !== firstAdminId);
        }

        setUsers(allUsers);

        try {
          const settingsRes = await api.get("/settings");
          setGovernanceMode(settingsRes.data.governanceMode);
        } catch (settingsErr) {
          console.error("Failed to fetch settings", settingsErr);
        }

        const welcomeMsg = `Welcome back, ${name}! System is running smoothly.`;
        // setNotifications logic removed in favor of context

        if (!sessionStorage.getItem("admin_welcome_shown")) {
          showInfo(welcomeMsg);
          addNotification({
            title: "System",
            message: welcomeMsg,
            type: "info"
          });
          sessionStorage.setItem("admin_welcome_shown", "true");
        }
      } catch (err: unknown) {
        const error = err as AxiosError;
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          navigate("/login");
        } else {
          showError("Failed to load dashboard data.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate, showError, showInfo, refreshTrigger, addNotification]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("admin_welcome_shown");
    navigate("/login");
  };

  const sidebarItems = [
    { icon: <FiLayout />, label: "Overview", id: "Overview" },
    { icon: <FiShield />, label: "Management", id: "UserManagement" },
    { icon: <FiSettings />, label: "Settings", id: "Settings" },
  ];

  const [isRoleDropDownOpen, setIsRoleDropDownOpen] = useState(false);

  // Map ids <-> slugs
  const idToSlug: Record<string, string> = {
    Overview: "overview",
    UserManagement: "management",
    Settings: "settings",
  };
  const slugToId: Record<string, string> = Object.fromEntries(
    Object.entries(idToSlug).map(([k, v]) => [v.toLowerCase(), k]),
  );

  // On mount / when URL changes, sync active tab
  useEffect(() => {
    if (section) {
      const mapped = slugToId[section.toLowerCase()] || "Overview";
      setActiveTab(mapped as "Overview" | "UserManagement" | "Settings");
    } else {
      // ensure URL shows default slug
      const defaultSlug = idToSlug["Overview"];
      navigate(`/admin/dashboard/${defaultSlug}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  // Pass a handler that navigates + updates state
  const handleTabChange = (id: string) => {
    const slug = idToSlug[id] || idToSlug["Overview"];
    navigate(`/admin/dashboard/${slug}`);
    setActiveTab(id as "Overview" | "UserManagement" | "Settings");
  };

  return (
    <DashboardLayout
      title="AdminPanel"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      userProfile={{
        name: adminName,
        email: adminEmail,
        username: adminUsername,
        role: "Administrator",
      }}
      notifications={notifications}
      onLogout={handleLogout}
      onEditProfile={() => setIsProfileModalOpen(true)}
      accentColor="emerald"
      isScrollable={false}
    >
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
          {activeTab === "Overview" && (
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  System Overview
                </h1>
                <p className="text-sm text-gray-500">
                  Real-time performance and user metrics.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
                {statsData && [
                  { icon: <FiUsers />, title: "Total Users", value: statsData.totalUsers, change: "+12%" },
                  { icon: <FiActivity />, title: "Active Users", value: statsData.activeUsers, change: "+8%" },
                  { icon: <FiShield />, title: "Security Alerts", value: statsData.securityAlerts, change: "-2%" },
                  { icon: <FiLayout />, title: "System Uptime", value: statsData.systemUptime, change: "+5%" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        {stat.icon}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg">
                        {stat.change}
                      </span>
                    </div>
                    <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1 relative z-10">
                      {stat.title}
                    </h3>
                    <p className="text-2xl font-bold dark:text-white relative z-10">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "UserManagement" && (
            <div className="flex-1 overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold dark:text-white">
                    Role Governance
                  </h1>
                  <p className="text-sm text-gray-500">
                    {governanceMode === "MODE_2"
                      ? "Hierarchy Mode: You can promote Authors to the Admin role."
                      : "Assign and modify permissions across the platform."}
                  </p>
                </div>
                <div className="flex items-center gap-2 relative">

                  {/* FILTER BUTTON */}
                  <div className="relative">
                    <button
                      onClick={() => setIsRoleDropDownOpen(!isRoleDropDownOpen)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${roleFilter === "all"
                        ? "bg-white dark:bg-gray-700 shadow-sm text-emerald-500"
                        : "bg-white dark:bg-gray-700 shadow-sm text-emerald-500"
                        }`}
                    >
                      {roleFilter.toUpperCase()}
                      <FiChevronDown size={12}
                        className={`transition-transform duration-200 ${isRoleDropDownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isRoleDropDownOpen && (
                      <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 z-50">
                        {["all", "admin", "author", "editor", "user"].map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setRoleFilter(r);
                              setIsRoleDropDownOpen(false);
                            }}
                            className={`block w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-gray-100 dark:hover:bg-gray-600 ${roleFilter === r
                              ? "text-emerald-500"
                              : "text-gray-600 dark:text-gray-300"
                              }`}
                          >
                            {r.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {users
                        .filter((u) => {
                          if (roleFilter !== "all" && u.role !== roleFilter)
                            return false;
                          if (governanceMode === "MODE_2")
                            return u.role === "author";
                          return true;
                        })
                        .map((u) => (
                          <UserManagementRow
                            key={u._id}
                            user={u}
                            allowedRoles={governanceMode === "MODE_2"
                              ? ["author", "admin"]
                              : ["user", "author", "editor", "admin"]}
                            onRoleChange={async (id, role) => {
                              try {
                                await api.put(`/auth/admin/users/${id}/role`, {
                                  role,
                                });
                                setUsers((prev) => prev.map((user) => user._id === id ? { ...user, role } : user
                                )
                                );
                                showSuccess("Role updated successfully");
                              } catch {
                                showError("Failed to update role");
                              }
                            }} />
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Settings" && (
            <div className="flex-1 overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-4 duration-500 pr-1 pb-8">
              <Settings />
            </div>
          )}
        </div>
      )}

      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={{
          name: adminName,
          username: adminUsername,
          email: adminEmail,
        }}
        onUpdate={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;
