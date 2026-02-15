import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  UserManagementRow,
  type IUser,
  type IAdminStats,
  type INotification,
} from "./AdminComponents";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();
  const [adminName, setAdminName] = useState("Admin");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<IUser[]>([]);
  const [statsData, setStatsData] = useState<IAdminStats | null>(null);
  const [notifications, setNotifications] = useState<INotification[]>([]);
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
        setUsers(usersRes.data.users || []);

        try {
          const settingsRes = await api.get("/settings");
          setGovernanceMode(settingsRes.data.governanceMode);
        } catch (settingsErr) {
          console.error("Failed to fetch settings", settingsErr);
        }

        const welcomeMsg = `Welcome back, ${name}! System is running smoothly.`;
        setNotifications([
          {
            id: Date.now().toString(),
            title: "System",
            message: welcomeMsg,
            time: "Just now",
            isRead: false,
          },
        ]);

        if (!sessionStorage.getItem("admin_welcome_shown")) {
          showInfo(welcomeMsg);
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
  }, [navigate, showError, showInfo, refreshTrigger]);


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

  const stats = [
    { title: "Total Users", value: statsData?.totalUsers || "0", change: "+12%", icon: <FiUsers className="w-6 h-6" /> },
    { title: "Active Sessions", value: statsData?.activeUsers || "0", change: "+5%", icon: <FiActivity className="w-6 h-6" /> },
    { title: "Security Alerts", value: statsData?.securityAlerts || "0", change: "Stable", icon: <FiShield className="w-6 h-6" /> },
    { title: "System Uptime", value: statsData?.systemUptime || "99.9%", change: "Perfect", icon: <FiLayout className="w-6 h-6" /> },
  ];

  if (isLoading) {
    return (
      <div className="h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
 
  return (
    <DashboardLayout
      title="AdminPanel"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as "Overview" | "UserManagement" | "Settings")}
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
      <div className="h-full flex flex-col animate-in fade-in duration-500">
        {activeTab === "Overview" && (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">System Overview</h1>
              <p className="text-sm text-gray-500">Real-time performance and user metrics.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      {stat.icon}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1 relative z-10">{stat.title}</h3>
                  <p className="text-2xl font-bold dark:text-white relative z-10">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
 

 
        {activeTab === "UserManagement" && (
          <div className="flex-1 overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold dark:text-white">Role Governance</h1>
                  <p className="text-sm text-gray-500">
                    {governanceMode === "MODE_2" 
                      ? "Hierarchy Mode: You can promote Authors to the Admin role." 
                      : "Assign and modify permissions across the platform."}
                  </p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
                  {['all', 'admin', 'author', 'editor', 'user'].map(r => (
                    <button 
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap ${roleFilter === r ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-500' : 'text-gray-500 hover:text-emerald-500'}`}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
             </div>
             <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto no-scrollbar">
                   <table className="w-full text-left">
                     <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                       {users
                         .filter(u => {
                           if (roleFilter !== 'all' && u.role !== roleFilter) return false;
                           if (governanceMode === "MODE_2") return u.role === "author";
                           return true;
                         })
                         .map(u => (
                          <UserManagementRow 
                            key={u._id} 
                            user={u} 
                            allowedRoles={governanceMode === "MODE_2" ? ["author", "admin"] : ["user", "author", "editor", "admin"]}
                            onRoleChange={async (id, role) => {
                              try {
                                await api.put(`/auth/admin/users/${id}/role`, { role });
                                setUsers(prev => prev.map(user => user._id === id ? { ...user, role } : user));
                                showSuccess("Role updated successfully");
                              } catch {
                                showError("Failed to update role");
                              }
                            }} 
                          />
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

      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={{ name: adminName, username: adminUsername, email: adminEmail }}
        onUpdate={() => setRefreshTrigger(prev => prev + 1)}
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;
