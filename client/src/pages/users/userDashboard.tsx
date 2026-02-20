import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiActivity, FiLayout, FiCheckCircle, FiFileText, FiSettings, FiCalendar } from "react-icons/fi";
import { BsFillKanbanFill } from "react-icons/bs";
import Kanban from "../../components/Kanban";
import Calendar from "../../components/Calendar";
import api from "../../api/axios";
import { AxiosError } from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import ProfileEditModal from "../../components/ProfileEditModal";
import Loader from "../../components/Loader";
import { type IUser, type INotification } from "./UsersComponents";
import { UserManagementRow } from "../admin/AdminComponents";
import { useDashboardSlug } from "../../components/url_slug";
import FormSection from "../../components/FormSection";
import { useToast } from "../../components/ToastProvider";
import UsersSettings from "../../components/UsersSettings";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const idToSlug = {
    Overview: "Overview",
    UserManagement: "UserManagement",
    RoleChange: "RoleChange",
    Calendar: "calendar",
    Kanban: "kanban",
    Settings: "settings",
  };
  const { activeTab, handleTabChange } = useDashboardSlug(idToSlug, "Overview");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [users, setUsers] = useState<IUser[]>([]);
  const previousRole = useRef<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const profileRes = await api.get("/auth/profile");
        const user = profileRes.data.user;
        previousRole.current = user.role;

        setUserName(user.name || user.username);
        setUserUsername(user.username);
        setUserEmail(user.email);
        setUserRole(user.role);

        try {
          const overviewRes = await api.get("/auth/overview");
          if (overviewRes?.data) {
            setNotifications([
              {
                id: Date.now().toString(),
                title: "System",
                message: `Welcome back! ${overviewRes.data.totalUsers} users online.`,
                time: "Just now",
                isRead: false,
              },
            ]);
          }
        } catch {
          /* ignore */
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
  }, [navigate, refreshTrigger]);

  useEffect(() => {
    if (activeTab) {
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

  const handleLogout = async () => {
    try {
      if (userEmail) {
        await api.post("/auth/logout", { email: userEmail });
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    showSuccess("You have been logged out successfully");
    navigate("/");
  };

  const sidebarItems = [
    { icon: <FiLayout />, label: "Overview", id: "Overview" },
    { icon: <FiUsers />, label: "Management", id: "UserManagement" },
    { icon: <FiFileText />, label: "Role Request", id: "RoleChange" },
    { icon: <FiCalendar />, label: "Calendar", id: "Calendar" },
    { icon: <BsFillKanbanFill />, label: "Kanban", id: "Kanban" },
    { icon: <FiSettings />, label: "Settings", id: "Settings" },
  ];

  const stats = [
    {
      title: "Personal Impact",
      value: "Verified",
      change: "Level 1",
      icon: <FiCheckCircle className="w-6 h-6" />,
    },
    {
      title: "System Status",
      value: "Optimal",
      change: "99.9%",
      icon: <FiActivity className="w-6 h-6" />,
    },
  ];



  return (
    <DashboardLayout
      title="UserPanel"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      userProfile={{
        name: userName,
        email: userEmail,
        username: userUsername,
        role: userRole === "admin" ? "Administrator" : "Member",
      }}
      notifications={notifications}
      onLogout={handleLogout}
      onEditProfile={() => setIsProfileModalOpen(true)}
      accentColor="blue"
      isScrollable={false}
    >
      <div className="h-full flex flex-col animate-in fade-in duration-500">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader text="Loading your workspace..." />
          </div>
        ) : activeTab === "Overview" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold dark:text-white">
                Hi, {userName}
              </h1>
              <p className="text-sm text-gray-500">
                Track your progress and community metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
                    <div className="p-3 md:p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {stat.icon}
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-lg">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 relative z-10">
                    {stat.title}
                  </h3>
                  <p className="text-2xl md:text-3xl font-bold dark:text-white relative z-10">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 p-8 md:p-12 text-center shadow-sm relative overflow-hidden group mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 rotate-3 group-hover:rotate-0 transition-transform">
                  <FiLayout className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  Member Workspace
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  We're building something special for you. Stay tuned for new
                  modules and interactivity features!
                </p>
              </div>
            </div>
          </div>
        ) : activeTab === "RoleChange" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <FormSection />
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
            <UsersSettings />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <h1 className="text-2xl font-bold dark:text-white">
                Community
              </h1>
              <p className="text-sm text-gray-500">
                Discover and connect with members.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {users
                      .filter((u) => u.role === "user")
                      .map((u) => (
                        <UserManagementRow
                          key={u._id}
                          user={u}
                          allowedRoles={[]} // Read-only for users
                          onRoleChange={async () => { }} // No-op
                        />
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={{
          name: userName,
          username: userUsername,
          email: userEmail,
        }}
        onUpdate={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </DashboardLayout>
  );
};

export default UserDashboard;
