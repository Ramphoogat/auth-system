import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiActivity,
  FiLayout,
  FiEdit,
  FiShield,
  FiChevronDown,
  FiFileText,
  FiSettings,
  FiCalendar,
} from "react-icons/fi";
import { BsFillKanbanFill } from "react-icons/bs";
import Kanban from "../../components/Kanban";
import Calendar from "../../components/calendar_ui/Calendar";
import api from "../../api/axios";
import { AxiosError } from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import ProfileEditModal from "../../components/ProfileEditModal";
import Loader from "../../components/Loader";
import {
  type IUser,
  type IAdminStats,
  type INotification,
} from "./AuthorComponents";
import { UserManagementRow } from "../admin/AdminComponents";
import { useToast } from "../../components/ToastProvider";
import { useDashboardSlug } from "../../components/url_slug";
import FormSection from "../../components/FormSection";
import Requests from "../../components/requests";
import AuthorSettings from "../../components/AuthorSettings";

const AuthorDashboard = () => {
  const navigate = useNavigate();
  const [authorName, setAuthorName] = useState("Author");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorUsername, setAuthorUsername] = useState("");
  const [authorRole, setAuthorRole] = useState("author");
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<IUser[]>([]);
  const [statsData, setStatsData] = useState<IAdminStats | null>(null);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const idToSlug = { Overview: "overview", Management: "management", RoleChange: "RoleChange", Requests: "requests", Calendar: "calendar", Kanban: "kanban", Settings: "settings" };
  const { activeTab, handleTabChange } = useDashboardSlug(idToSlug, "Overview");

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [governanceMode, setGovernanceMode] = useState<string>("MODE_1");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isRoleDropDownOpen, setIsRoleDropDownOpen] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const profileRes = await api.get("/auth/profile");
        const user = profileRes.data.user;

        setAuthorName(user.name || user.username);
        setAuthorUsername(user.username);
        setAuthorEmail(user.email);
        setAuthorRole(user.role);

        if (user.role !== "admin" && user.role !== "author") {
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

        const welcomeMsg = `Welcome back, ${user.name || user.username || 'Author'}! Ready to create?`;
        setNotifications([{
          id: Date.now().toString(),
          title: "Creative Update",
          message: welcomeMsg,
          time: "Just now",
          isRead: false,
        }]);

        try {
          const settingsRes = await api.get("/settings");
          setGovernanceMode(settingsRes.data.governanceMode);
        } catch (err) {
          console.error("Failed to fetch settings", err);
        }

      } catch (err: unknown) {
        const error = err as AxiosError;
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      api.get("/auth/profile").then(res => {
        const user = res.data.user;
        setAuthorName(user.name || user.username);
        setAuthorUsername(user.username);
        setAuthorEmail(user.email);
      }).catch(() => { });
    }
  }, [refreshTrigger]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    showSuccess("You have been logged out successfully");
    navigate("/");
  };

  const sidebarItems = [
    { icon: <FiLayout />, label: "Overview", id: "Overview" },
    { icon: <FiShield />, label: "Management", id: "Management" },
    { icon: <FiFileText />, label: "Role Request", id: "RoleChange" },
    { icon: <FiFileText />, label: "Requests", id: "Requests" },
    { icon: <FiCalendar />, label: "Calendar", id: "Calendar" },
    { icon: <BsFillKanbanFill />, label: "Kanban", id: "Kanban" },
    { icon: <FiSettings />, label: "Settings", id: "Settings" },
  ];

  const stats = [
    { title: "Total Consumers", value: statsData?.totalUsers || "0", change: "+15%", icon: <FiUsers className="w-6 h-6" /> },
    { title: "Active Readers", value: statsData?.activeUsers || "0", change: "+5%", icon: <FiActivity className="w-6 h-6" /> },
  ];



  return (
    <DashboardLayout
      title="AuthorPanel"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      userProfile={{
        name: authorName,
        email: authorEmail,
        username: authorUsername,
        role: authorRole === "admin" ? "Administrator" : "Content Author",
      }}
      notifications={notifications}
      onLogout={handleLogout}
      onEditProfile={() => setIsProfileModalOpen(true)}
      accentColor="purple"
      isScrollable={false}
    >
      <div className="h-full flex flex-col animate-in fade-in duration-500">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader text="Loading your studio..." />
          </div>
        ) : activeTab === "Overview" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-8">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-4xl font-black dark:text-white tracking-tight">Studio Overview</h1>
              <p className="text-xs md:text-sm text-gray-500">Analytics and reach for your published content.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                  <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-500/5 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="p-3.5 bg-purple-50 dark:bg-purple-500/10 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                      {stat.icon}
                    </div>
                    <span className="text-[10px] font-black px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-600 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10">{stat.title}</h3>
                  <p className="text-2xl font-black dark:text-white relative z-10">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 md:p-12 text-center shadow-xl relative overflow-hidden group mb-8">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform mx-auto mb-6">
                  <FiEdit className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black dark:text-white mb-2">Content Ecosystem</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-2xl mx-auto">
                  The creative statistics and publication history integration is in progress.
                </p>
              </div>
            </div>
          </div>
        ) : activeTab === "RoleChange" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
            <FormSection />
          </div>
        ) : activeTab === "Requests" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold dark:text-white">Role Requests</h1>
              <p className="text-sm text-gray-500">Track and manage role updates.</p>
            </div>
            <Requests />
          </div>
        ) : activeTab === "Calendar" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
            <Calendar />
          </div>
        ) : activeTab === "Kanban" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
            <Kanban />
          </div>
        ) : activeTab === "Settings" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
            <AuthorSettings />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold dark:text-white">Author Governance</h1>
                <p className="text-sm text-gray-500">
                  Manage permissions for users under your hierarchy.
                </p>
              </div>
              <div className="flex items-center gap-2 relative">
                {/* ALL BUTTON */}
                <div className="relative">
                  <button
                    onClick={() => setIsRoleDropDownOpen(!isRoleDropDownOpen)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${roleFilter === "all"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-purple-500"
                      : "text-gray-500 hover:text-purple-500"
                      }`}
                  >
                    {roleFilter.toUpperCase()}
                    <FiChevronDown size={12}
                      className={`transition-transform duration-200 ${isRoleDropDownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isRoleDropDownOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 z-50">
                      {["all", "author", "editor", "user"].map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            setRoleFilter(r);
                            setIsRoleDropDownOpen(false);
                          }}
                          className={`block w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-gray-100 dark:hover:bg-gray-600 ${roleFilter === r
                            ? "text-purple-500"
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
                      .filter(u => {
                        // Allow Author, Editor, and User roles. Explicitly exclude Admin.
                        const allowedRoles = ["author", "editor", "user"];
                        if (!allowedRoles.includes(u.role)) return false;

                        // Apply the role filter
                        if (roleFilter !== 'all' && u.role !== roleFilter) return false;

                        return true;
                      })
                      .map(u => (
                        <UserManagementRow
                          key={u._id}
                          user={u}
                          allowedRoles={governanceMode === "MODE_2" ? ["editor", "author"] : ["editor", "user"]}
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
      </div >

      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={{ name: authorName, username: authorUsername, email: authorEmail }}
        onUpdate={() => setRefreshTrigger(prev => prev + 1)}
      />
    </DashboardLayout >
  );
};

export default AuthorDashboard;
