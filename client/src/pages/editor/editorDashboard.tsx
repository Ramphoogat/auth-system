import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiActivity,
  FiLayout,
  FiType,
  FiShield,
} from "react-icons/fi";
import api from "../../api/axios";
import { AxiosError } from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import ProfileEditModal from "../../components/ProfileEditModal";
import {
  type IUser,
  type IAdminStats,
  type INotification,
} from "./EditorComponents";
import { UserManagementRow } from "../admin/AdminComponents";
import { useToast } from "../../components/ToastProvider";

const EditorDashboard = () => {
  const navigate = useNavigate();
  const [editorName, setEditorName] = useState("Editor");
  const [editorEmail, setEditorEmail] = useState("");
  const [editorUsername, setEditorUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<IUser[]>([]);
  const [statsData, setStatsData] = useState<IAdminStats | null>(null);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [activeTab, setActiveTab] = useState<"Overview" | "Management">("Overview");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [governanceMode, setGovernanceMode] = useState<string>("MODE_1");
  const [roleFilter, setRoleFilter] = useState("all");
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const profileRes = await api.get("/auth/profile");
        const user = profileRes.data.user;

        setEditorName(user.name || user.username);
        setEditorUsername(user.username);
        setEditorEmail(user.email);

        if (!["admin", "author", "editor"].includes(user.role)) {
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

        const welcomeMsg = `Welcome, ${user.name || user.username || 'Editor'}! Ready to refine content?`;
        setNotifications([{
          id: Date.now().toString(),
          title: "Editorial Notice",
          message: welcomeMsg,
          time: "Just now",
          isRead: false,
        }]);

        // Fetch settings for governance mode
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
            setEditorName(user.name || user.username);
            setEditorUsername(user.username);
            setEditorEmail(user.email);
        }).catch(() => {});
    }
  }, [refreshTrigger]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const sidebarItems = [
    { icon: <FiLayout />, label: "Overview", id: "Overview" },
    { icon: <FiShield />, label: "Management", id: "Management" },
  ];

  const stats = [
    { title: "Total Readers", value: statsData?.totalUsers || "0", change: "+8%", icon: <FiUsers className="w-6 h-6" /> },
    { title: "Engagement", value: "Verified", change: "Stable", icon: <FiActivity className="w-6 h-6" /> },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="EditorPanel"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as "Overview" | "Management")}
      userProfile={{
        name: editorName,
        email: editorEmail,
        username: editorUsername,
        role: "Content Editor",
      }}
      notifications={notifications}
      onLogout={handleLogout}
      onEditProfile={() => setIsProfileModalOpen(true)}
      accentColor="blue"
      isScrollable={false}
    >
      <div className="h-full flex flex-col animate-in fade-in duration-500">
        {activeTab === "Overview" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold dark:text-white tracking-tight">Editorial Hub</h1>
              <p className="text-xs md:text-sm text-gray-500">Review and moderate user interactions and content flow.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:translate-y-[-4px] transition-all">
                   <div className="flex justify-between items-start mb-4 md:mb-6">
                      <div className="p-3 md:p-4 bg-cyan-50 dark:bg-cyan-500/10 rounded-2xl text-cyan-600">
                        {stat.icon}
                      </div>
                      <span className="text-[10px] font-bold px-3 py-1 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 rounded-lg">
                        {stat.change}
                      </span>
                   </div>
                   <h3 className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</h3>
                   <p className="text-2xl md:text-3xl font-bold dark:text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-[32px] md:rounded-[48px] border border-white/50 dark:border-gray-700 p-8 md:p-16 text-center shadow-inner mt-8">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-xl text-cyan-500">
                  <FiType className="w-8 h-8 md:w-10 md:h-10" />
               </div>
               <h3 className="text-lg md:text-xl font-bold mb-4">Editorial Queue</h3>
               <p className="text-sm text-gray-400 max-w-md mx-auto">The content moderation engine is being integrated. You'll soon be able to review pending posts and user comments here.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold dark:text-white">Editor Governance</h1>
                <p className="text-sm text-gray-500">
                   Manage permissions for users under your hierarchy.
                </p>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
                  {['all', 'editor', 'user'].map(r => (
                    <button 
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap ${roleFilter === r ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
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
                           // Allow Editor and User roles. Explicitly exclude Admin/Author.
                           const allowedRoles = ["editor", "user"];
                           if (!allowedRoles.includes(u.role)) return false;
                           
                           // Apply the role filter
                           if (roleFilter !== 'all' && u.role !== roleFilter) return false;
                           
                           return true;
                        })
                        .map(u => (
                          <UserManagementRow 
                            key={u._id} 
                            user={u} 
                            allowedRoles={governanceMode === "MODE_2" ? ["user", "editor"] : ["user"]}
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
      </div>

      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={{ name: editorName, username: editorUsername, email: editorEmail }}
        onUpdate={() => setRefreshTrigger(prev => prev + 1)}
      />
    </DashboardLayout>
  );
};

export default EditorDashboard;
