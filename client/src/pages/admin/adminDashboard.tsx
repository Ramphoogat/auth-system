import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiSettings,
  FiActivity,
  FiShield,
  FiLayout,
  FiTrash2,
} from "react-icons/fi";

import api from "../../api/axios";
import { AxiosError } from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import ProfileEditModal from "../../components/ProfileEditModal";
import Loader from "../../components/Loader";
import FormSection from "../../components/FormSection";
import Requests from "../../components/requests";
import CreateUserModal from "../../components/CreateUserModal";
import GoogleSheetsModal from "../../components/GoogleSheetsModal";
import OurTeams from "../../components/OurTeams";

import Settings from "../../components/AdminSettings";
import { useToast } from "../../components/ToastProvider";

import { FiChevronDown } from "react-icons/fi";
import { useDashboardSlug } from "../../components/url_slug";
import {
  UserManagementRow,
  type IUser,
  type IAdminStats,
  type INotification,
} from "./AdminComponents";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [adminName, setAdminName] = useState("Admin");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [users, setUsers] = useState<IUser[]>([]);
  const [statsData, setStatsData] = useState<IAdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications] = useState<INotification[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [roleFilter, setRoleFilter] = useState("all");
  const [isRoleDropDownOpen, setIsRoleDropDownOpen] = useState(false);

  const idToSlug = {
    Overview: "overview",
    UserManagement: "management",
    Settings: "settings",
    Form: "Form",
    Requests: "requests",
    OurTeams: "teams",
  };

  const { activeTab, handleTabChange } = useDashboardSlug(idToSlug, "Overview");

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filteredUsers = (() => {
    const admins = users.filter((u) => u.role === "admin");
    const firstAdmin = admins.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    )[0];
    const firstAdminId = firstAdmin && firstAdmin._id;

    return users.filter((u) => {
      if (firstAdminId && u._id === firstAdminId)
        return false;
      if (roleFilter !== "all" && u.role !== roleFilter)
        return false;
      return true;
    });
  })();

  const handleSelectUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This cannot be undone.`)) return;

    try {
      setIsLoading(true);
      await Promise.all(selectedUsers.map(id => api.delete(`/auth/admin/users/${id}`)));
      showSuccess(`Deleted ${selectedUsers.length} users`);
      setRefreshTrigger(p => p + 1);
      setSelectedUsers([]);
    } catch (error) {
      showError("Failed to delete users");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const profileRes = await api.get("/auth/profile");
        const user = profileRes.data.user;

        setAdminName(user.name || user.username);
        setAdminUsername(user.username);
        setAdminEmail(user.email);

        if (user.role !== "admin") {
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
    fetchInitialData();
  }, [navigate]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      const refreshData = async () => {
        try {
          const [profileRes, overviewRes, usersRes] = await Promise.all([
            api.get("/auth/profile"),
            api.get("/auth/overview"),
            api.get("/auth/admin/users"),
          ]);

          const user = profileRes.data.user;
          setAdminName(user.name || user.username);
          setAdminUsername(user.username);
          setAdminEmail(user.email);

          setStatsData({
            totalUsers: overviewRes.data.totalUsers,
            activeUsers: overviewRes.data.activeUsers,
            securityAlerts: overviewRes.data.securityAlerts,
            systemUptime: overviewRes.data.systemUptime,
          });

          setUsers(usersRes.data.users || []);
        } catch (error) {
          console.error("Failed to refresh data", error);
        }
      };
      refreshData();
    }
  }, [refreshTrigger]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", { email: adminEmail });
    } catch (error) {
      console.error("Logout failed", error);
    }
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    showSuccess("You have been logged out successfully (Grace period active)");
    navigate("/");
  };

  const sidebarItems = [
    { icon: <FiLayout />, label: "Overview", id: "Overview" },
    { icon: <FiShield />, label: "Management", id: "UserManagement" },
    { icon: <FiLayout />, label: "Role Request Form", id: "Form" },
    { icon: <FiShield />, label: "Requests", id: "Requests" },
    { icon: <FiUsers />, label: "Our Teams", id: "OurTeams" },
    { icon: <FiSettings />, label: "Settings", id: "Settings" },
  ];

  const stats = [
    {
      title: "Total Users",
      value: statsData?.totalUsers || "0",
      change: "+12%",
      icon: <FiUsers className="w-6 h-6" />,
    },
    {
      title: "Active Now",
      value: statsData?.activeUsers || "0",
      change: "+5%",
      icon: <FiActivity className="w-6 h-6" />,
    },
    {
      title: "Security Alerts",
      value: statsData?.securityAlerts || "0",
      change: "-2%",
      icon: <FiShield className="w-6 h-6" />,
    },
    {
      title: "System Uptime",
      value: statsData?.systemUptime || "99.9%",
      change: "Stable",
      icon: <FiActivity className="w-6 h-6" />,
    },
  ];


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
      accentColor="indigo"
      isScrollable={false}
    >
      <div className="h-full flex flex-col animate-in fade-in duration-500">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader text="Loading dashboard data..." />
          </div>
        ) : activeTab === "Overview" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-8">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-4xl font-black dark:text-white tracking-tight">
                System Overview
              </h1>
              <p className="text-xs md:text-sm text-gray-500">
                Real-time metrics and system health indicators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600">
                      {stat.icon}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded-lg">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-black dark:text-white">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "UserManagement" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold dark:text-white">
                  User Management
                </h1>
                <p className="text-sm text-gray-500">
                  Manage user roles and permissions.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedUsers.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center justify-center px-4 py-2 text-xs font-bold rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 transition-all shadow-sm"
                  >
                    <FiTrash2 className="mr-2" /> Delete ({selectedUsers.length})
                  </button>
                )}
                <button
                  onClick={() => setIsCreateUserModalOpen(true)}
                  className="flex items-center justify-center px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 text-white hover:bg-red-400 transition-all shadow-sm"
                >
                  Create
                </button>

                <button
                  onClick={() => setIsGoogleSheetModalOpen(true)}
                  className="flex items-center justify-center px-4 py-2 text-xs font-bold rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-all shadow-sm"
                >
                  <FiActivity className="mr-2" /> Sheets
                </button>

                {/*Import CSV Button*/}
                <input type="file" id="csvInput" accept=".csv" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log("Selected file:", file);
                    // parshing the csv here
                  }
                }} />
                <button
                  onClick={() => document.getElementById("csvInput")?.click()}
                  className="flex items-center justify-center px-4 py-2 text-xs font-bold rounded-lg bg-gray-500 text-white hover:bg-emerald-400 transition-all shadow-sm"
                >
                  Import CSV
                </button>

                {/*Export CSV Button*/}
                <button
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," + ["Name,Email,Role"].concat(users.map((u) => `${u.name || ''},${u.email},${u.role}`)).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "users.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center justify-center px-4 py-2 text-xs font-bold rounded-lg bg-gray-500 text-gray-200 hover:bg-red-400 transition-all shadow-sm"
                >
                  Export CSV
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsRoleDropDownOpen(!isRoleDropDownOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all border border-transparent ${roleFilter === "all"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-500"
                      : "text-gray-500 hover:text-indigo-500 border-gray-200 dark:border-gray-700"
                      }`}
                  >
                    {roleFilter.toUpperCase()}
                    <FiChevronDown
                      size={12}
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
                            ? "text-indigo-500"
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
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold border-b border-gray-100 dark:border-gray-700">
                    <tr>
                      <th className="px-4 md:px-6 py-3 w-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer align-middle"
                          checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-4 md:px-6 py-3">User</th>
                      <th className="hidden md:table-cell px-6 py-3">Email</th>
                      <th className="px-2 md:px-6 py-3">Role</th>
                      <th className="hidden sm:table-cell px-6 py-3">Status</th>
                      <th className="px-4 md:px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredUsers.map((u) => (
                      <UserManagementRow
                        key={u._id}
                        user={u}
                        allowedRoles={["admin", "author", "editor", "user"]}
                        isSelected={selectedUsers.includes(u._id)}
                        onSelect={handleSelectUser}
                        onRoleChange={async (id, role) => {
                          try {
                            await api.put(`/auth/admin/users/${id}/role`, {
                              role,
                            });
                            setUsers((prev) =>
                              prev.map((user) =>
                                user._id === id ? { ...user, role } : user,
                              ),
                            );
                            showSuccess("Role updated successfully");
                          } catch {
                            showError("Failed to update role");
                          }
                        }}
                      />
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-sm">
                          No users found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "Form" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
            <FormSection />
          </div>
        ) : activeTab === "Requests" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold dark:text-white">
                Role Requests
              </h1>
              <p className="text-sm text-gray-500">
                Manage pending role change applications.
              </p>
            </div>
            <Requests />
          </div>
        ) : activeTab === "OurTeams" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
            <OurTeams />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-4 duration-500 pr-1 pb-8">
            <Settings />
          </div>
        )}
      </div>

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

      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onUserCreated={() => setRefreshTrigger((prev) => prev + 1)}
      />

      <GoogleSheetsModal
        isOpen={isGoogleSheetModalOpen}
        onClose={() => setIsGoogleSheetModalOpen(false)}
        onSyncComplete={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;
