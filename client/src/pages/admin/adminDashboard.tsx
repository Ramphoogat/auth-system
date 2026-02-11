import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, 
  FiSettings, 
  FiLogOut, 
  FiActivity, 
  FiShield, 
  FiLayout,
  FiBell,
  FiSearch,
  FiMenu,
  FiChevronsLeft,
  FiArrowUp,
  FiCheckCircle,
  FiX,
  FiMonitor,
  FiLayout as LayoutIcon
} from 'react-icons/fi';
import api from '../../api/axios';
import bgMacOS from '../../assets/MacOS.jpg';
import bgColorful from '../../assets/Colorful.jpg';
import bgMacBook from '../../assets/MacBook Pro 14 wallpaper.jpg';
import bgSilent from '../../assets/Silent Mystic Haven.jpg';
import bgBeach from '../../assets/beachhouse.jpg';
import bgCat from '../../assets/cat.jpg';
import bgDownload from '../../assets/download.jpg';
import bgMacOS1 from '../../assets/macOS1.jpg';
import bgMacOS2 from '../../assets/macOS2.jpg';
import bgMarbel from '../../assets/marbel.jpg';
import bgMindset from '../../assets/mindset.jpg';

const BACKGROUNDS = [
  { id: 'macos', name: 'macOS Mojave', image: bgMacOS },
  { id: 'macos1', name: 'macOS High Sierra', image: bgMacOS1 },
  { id: 'macos2', name: 'macOS Catalina', image: bgMacOS2 },
  { id: 'colorful', name: 'Colorful Gradient', image: bgColorful },
  { id: 'macbook', name: 'MacBook Pro 14', image: bgMacBook },
  { id: 'silent', name: 'Silent Mystic', image: bgSilent },
  { id: 'beach', name: 'Beach House', image: bgBeach },
  { id: 'marbel', name: 'Marble Texture', image: bgMarbel },
  { id: 'mindset', name: 'Mindset', image: bgMindset },
  { id: 'cat', name: 'Cozy Cat', image: bgCat },
  { id: 'download', name: 'Abstract', image: bgDownload },
];

interface IUser {
  _id: string;
  name?: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  isPhoneVerified: boolean;
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [adminName, setAdminName] = useState('Admin');
  const [adminEmail, setAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<IUser[]>([]);
  const [statsData, setStatsData] = useState<IAdminStats | null>(null);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [welcomeToast, setWelcomeToast] = useState<{ id: string; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Clients' | 'Appearances' | 'Settings'>('Overview');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentBg, setCurrentBg] = useState(() => {
    return localStorage.getItem('admin_dashboard_bg') || bgMacOS;
  });
  const [showScrollButton, setShowScrollButton] = useState(() => {
    const saved = localStorage.getItem('admin_show_scroll_button');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAppliedToast, setShowAppliedToast] = useState(false);
  const mainContentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [profileRes, statsRes, usersRes] = await Promise.all([
          api.get('/auth/profile'),
          api.get('/auth/admin/stats'),
          api.get('/auth/admin/users')
        ]);

        const name = profileRes.data.user.name || profileRes.data.user.username;
        setAdminName(name);
        setAdminEmail(profileRes.data.user.email);
        setStatsData(statsRes.data);
        setUsers(usersRes.data.users);

        // Add welcome notification
        const welcomeId = Date.now().toString();
        const welcomeMsg = `Welcome back, ${name}! System is running smoothly.`;
        
        setNotifications([{
          id: welcomeId,
          title: 'System',
          message: welcomeMsg,
          time: 'Just now',
          isRead: false
        }]);

        // Show welcome toast for 3 seconds
        setWelcomeToast({ id: welcomeId, message: welcomeMsg });
        setTimeout(() => {
          setWelcomeToast(null);
        }, 3000);

      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        // If unauthorized, redirect to login
        navigate('/login');
      } finally {
        setIsLoading(false); 
      }
    };
    fetchData();
  }, [navigate]);
// Scroll Button for appearance tab
  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        setIsScrolled(mainContentRef.current.scrollTop > 100);
      }
    };

    const mainElement = mainContentRef.current;
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    localStorage.setItem('admin_show_scroll_button', JSON.stringify(showScrollButton));
  }, [showScrollButton]);

  const handleBgChange = (bgImage: string) => {
    setCurrentBg(bgImage);
    localStorage.setItem('admin_dashboard_bg', bgImage);
    setShowAppliedToast(true);
    setTimeout(() => setShowAppliedToast(false), 3000);
  };


  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const stats = [
    { title: 'Total Users', value: statsData?.totalUsers || '0', change: '+12%', icon: <FiUsers className="w-6 h-6" /> },
    { title: 'Active Sessions', value: statsData?.activeUsers || '0', change: '+5%', icon: <FiActivity className="w-6 h-6" /> },
    { title: 'Security Alerts', value: statsData?.securityAlerts || '0', change: 'Stable', icon: <FiShield className="w-6 h-6" /> },
    { title: 'System Uptime', value: statsData?.systemUptime || '99.9%', change: 'Perfect', icon: <FiLayout className="w-6 h-6" /> },
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
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white/70 backdrop-blur-xl border-r border-white/20 transition-all duration-300 ease-in-out flex flex-col z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              AdminPanel
            </h2>
          ) : (
            <FiShield className="w-8 h-8 text-emerald-400" />
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-gray-100 text-gray-700 hover:text-black rounded-lg transition-all duration-300"
          >
            {isSidebarOpen ? <FiChevronsLeft className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem 
            icon={<FiLayout />} 
            label="Overview" 
            active={activeTab === 'Overview'} 
            isOpen={isSidebarOpen} 
            onClick={() => setActiveTab('Overview')} 
          />

          <SidebarItem 
            icon={<FiUsers />} 
            label="Clients" 
            active={activeTab === 'Clients'} 
            isOpen={isSidebarOpen} 
            onClick={() => setActiveTab('Clients')} 
          />

          <SidebarItem 
            icon={<FiMonitor />} 
            label="Appearances" 
            active={activeTab === 'Appearances'} 
            isOpen={isSidebarOpen} 
            onClick={() => setActiveTab('Appearances')} 
          /> 

          <SidebarItem 
            icon={<FiSettings />} 
            label="Settings" 
            active={activeTab === 'Settings'} 
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab('Settings')}
          />
        </nav>

        <div className="p-4 border-t border-white/20">
          <div 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={`cursor-pointer group flex flex-col ${isSidebarOpen ? 'px-2' : 'items-center'} py-2 rounded-2xl transition-all duration-300 ${isProfileMenuOpen ? 'bg-white/50 shadow-xl border border-white/30' : 'hover:bg-white/20'}`}
          >
            {isProfileMenuOpen && (
              <div className={`w-full mb-3 space-y-1 ${isSidebarOpen ? 'px-2' : 'px-1'} pt-2 animate-in slide-in-from-bottom-2 duration-300`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className={`w-full flex items-center ${isSidebarOpen ? 'px-3' : 'justify-center'} py-2.5 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-200 shadow-sm`}>
                  <FiLogOut className="w-4 h-4" />
                  {isSidebarOpen && <span className="ml-3 text-xs font-bold uppercase tracking-wider">Sign Out</span>}
                </button>
              </div>
            )}

            <div className={`flex items-center w-full ${isSidebarOpen ? 'p-1' : 'justify-center p-0.5'}`}>
              <div className="relative pointer-events-none p-0.5 bg-gradient-to-tr from-emerald-400 to-cyan-400 rounded-full shadow-md">
                <img
                  src={`https://unavatar.io/${encodeURIComponent(adminEmail)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}`}
                  alt="Admin"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              </div>
              {isSidebarOpen && (
                <div className="ml-3 overflow-hidden flex-1 pointer-events-none">
                  <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{adminName}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Administrator</p>
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
              placeholder="Search dashboard..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder-slate-400 ml-3"
            />
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                className={`relative p-2 ${showNotificationDrawer ? 'text-black' : 'text-gray-600'} hover:text-black transition-colors`}
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
                      notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-white/10 hover:bg-white/30 transition-colors group relative">
                          <p className="text-xs font-bold text-emerald-700 mb-1">{n.title}</p>
                          <p className="text-sm text-gray-800 pr-6">{n.message}</p>
                          <p className="text-[10px] text-gray-500 mt-2">{n.time}</p>
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
                        <p className="text-sm text-gray-500">No new notifications</p>
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
                  <h4 className="font-bold text-black text-sm">System Update</h4>
                  <p className="text-gray-700 text-xs">{welcomeToast.message}</p>
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
          {activeTab === 'Overview' ? (
            <>
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome back, {adminName}</h1>
                <p className="text-slate-500 text-sm">Overview of your system activity.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/30 shadow-xl hover:bg-white/70 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-white/40 rounded-2xl text-slate-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                        {stat.icon}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${stat.change.includes('+') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{stat.title}</h3>
                      <p className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white/50 backdrop-blur-xl rounded-[32px] border border-white/30 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">System Residents</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Recently active members</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-800 text-white rounded-full text-xs font-semibold hover:bg-emerald-600 transition-all shadow-md">All Users</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/20 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.length > 0 ? (
                        users.filter(u => u.role === 'admin').map((user) => (
                          <UserRow 
                            key={user._id}
                            name={user.name || user.username} 
                            email={user.email} 
                            role={user.role === 'admin' ? 'Admin' : 'User'} 
                            status={user.isVerified || user.isPhoneVerified ? 'Active' : 'Unverified'} 
                            date={formatRelativeTime(user.createdAt)} 
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                            No users found in the database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : activeTab === 'Clients' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Client Management</h1>
                  <p className="text-slate-500 text-sm">Manage and monitor all public user accounts.</p>
                </div>
                <div className="flex bg-white/40 backdrop-blur-md rounded-xl p-1 border border-white/30 shadow-sm">
                  <button className="px-4 py-2 text-xs font-bold bg-white/60 text-slate-800 rounded-lg shadow-sm">All Clients</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.length > 0 ? (
                  users.filter(u => u.role !== 'admin').map((client) => (
                    <div key={client._id} className="bg-white/50 backdrop-blur-xl p-6 rounded-[28px] border border-white/30 shadow-xl hover:bg-white/70 hover:shadow-2xl transition-all duration-300 group">
                      <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                          <img
                            src={`https://unavatar.io/${encodeURIComponent(client.email)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(client.name || client.username)}&background=random`}
                            alt={client.username}
                            className="w-20 h-20 rounded-3xl border-2 border-white object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ${client.isVerified || client.isPhoneVerified ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{client.name || client.username}</h3>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-1">{client.email}</p>
                        
                        <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="text-left">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Joined</p>
                            <p className="text-[11px] font-bold text-slate-600">{formatRelativeTime(client.createdAt)}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${client.isVerified || client.isPhoneVerified ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {client.isVerified || client.isPhoneVerified ? 'Active' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                   <div className="col-span-full py-20 text-center bg-white/30 backdrop-blur-md rounded-[32px] border border-white/20">
                     <FiUsers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                     <p className="text-slate-500 font-medium">No clients found in your database.</p>
                   </div>
                )}
              </div>

              {/* Recent Activity Table for Clients */}
              <div className="bg-white/50 backdrop-blur-xl rounded-[32px] border border-white/30 shadow-xl overflow-hidden mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Recent Activity</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Detailed log of latest client registrations</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/20 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                        <th className="px-6 py-4">Client</th>
                        <th className="px-6 py-4">Email Address</th>
                        <th className="px-6 py-4">Verification</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.length > 0 ? (
                        users.filter(u => u.role !== 'admin').slice(0, 8).map((client) => (
                          <tr key={client._id} className="hover:bg-white/20 transition-colors cursor-pointer group">
                             <td className="px-6 py-4">
                               <div className="flex items-center">
                                 <img
                                   src={`https://unavatar.io/${encodeURIComponent(client.email)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(client.name || client.username)}&background=random`}
                                   alt={client.username}
                                   className="w-8 h-8 rounded-xl border border-white/30 object-cover shadow-sm group-hover:scale-110 transition-transform duration-300 mr-3"
                                 />
                                 <span className="font-bold text-slate-800 text-sm">{client.name || client.username}</span>
                               </div>
                             </td>
                             <td className="px-6 py-4 text-slate-600 text-xs">{client.email}</td>
                             <td className="px-6 py-4">
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${client.isVerified ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200/30' : 'bg-blue-500/10 text-blue-600 border-blue-200/30'}`}>
                                 {client.isVerified ? 'Email Verified' : 'Email Pending'}
                               </span>
                             </td>
                             <td className="px-6 py-4">
                               <div className="flex items-center">
                                 <div className={`w-1.5 h-1.5 rounded-full mr-2 ${client.isVerified || client.isPhoneVerified ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                 <span className={`text-xs font-medium ${client.isVerified || client.isPhoneVerified ? 'text-slate-700' : 'text-slate-400'}`}>
                                   {client.isVerified || client.isPhoneVerified ? 'Active' : 'Inactive'}
                                 </span>
                               </div>
                             </td>
                             <td className="px-6 py-4 text-slate-500 text-xs">{formatRelativeTime(client.createdAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm font-medium italic">
                            No recent client activity found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'Appearances' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Appearances</h1>
                <p className="text-gray-600">Personalize your workspace with a premium selection of backgrounds.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {BACKGROUNDS.map((bg) => (
                  <div 
                    key={bg.id}
                    onClick={() => handleBgChange(bg.image)}
                    className={`group relative h-48 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-500 ${
                      currentBg === bg.image 
                        ? 'border-emerald-500 ring-[6px] ring-emerald-500/20 scale-[1.02]' 
                        : 'border-white/30 hover:border-white/60 hover:scale-[1.01]'
                    }`}
                  >
                    <img 
                      src={bg.image} 
                      alt={bg.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <div>
                        <p className="text-white text-xs font-medium uppercase tracking-wider mb-1 opacity-70">Background</p>
                        <p className="text-white text-sm font-bold">{bg.name}</p>
                      </div>
                    </div>
                    {currentBg === bg.image && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white p-2 rounded-full shadow-lg border border-white/20">
                        <FiCheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-white/40 backdrop-blur-md p-8 rounded-3xl border border-white/30 shadow-2xl mt-12 overflow-hidden relative group/settings">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/settings:opacity-10 transition-opacity duration-700">
                   <LayoutIcon className="w-32 h-32 -mr-8 -mt-8 rotate-12" />
                </div>
                
                <h2 className="text-xl font-bold text-black mb-8 flex items-center">
                  <div className="p-2 bg-black/5 rounded-lg mr-3">
                    <LayoutIcon className="w-5 h-5" />
                  </div>
                  System Preferences
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-5 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/60 hover:shadow-lg transition-all duration-300 group/item">
                    <div className="flex items-center space-x-5">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner group-hover/item:bg-emerald-500/20 transition-colors">
                        <FiArrowUp className="w-6 h-6 group-hover/item:animate-bounce" />
                      </div>
                      <div>
                        <h4 className="font-bold text-black">Quick Scroll Assistance</h4>
                        <p className="text-gray-600 text-sm">Always visible back-to-top button for easier navigation</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowScrollButton(!showScrollButton)}
                      className={`relative w-14 h-8 rounded-full transition-all duration-500 focus:outline-none ring-offset-2 focus:ring-2 focus:ring-emerald-500 ${showScrollButton ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-md ${showScrollButton ? 'left-7.5 translate-x-0' : 'left-1.5'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white/40 backdrop-blur-md rounded-2xl border border-white/30">
              <h2 className="text-2xl font-bold text-black mb-4">Settings</h2>
              <p className="text-gray-600">Administrative settings configuration coming soon.</p>
            </div>
          )}
        </div>

        {/* Floating Scroll Button */}
        {showScrollButton && (
          <button
            onClick={scrollToTop}
            className={`fixed bottom-10 right-10 p-5 bg-emerald-500 text-white rounded-2xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all duration-500 z-[60] hover:scale-110 active:scale-95 group border border-emerald-400/50 backdrop-blur-md hover:bg-emerald-400 ${
              isScrolled ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-20 invisible pointer-events-none'
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
              <span className="font-bold text-sm text-black">Theme matching applied successfully!</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const SidebarItem = ({ 
  icon, 
  label, 
  active = false, 
  isOpen,
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean, 
  isOpen: boolean,
  onClick?: () => void
}) => (
  <div 
    onClick={onClick}
    className={`flex items-center ${isOpen ? 'px-4' : 'justify-center'} py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
      active ? 'bg-white/40 text-black shadow-lg border border-white/20' : 'hover:bg-white/20 text-gray-700 hover:text-black'
    }`}
  >
    <div className={`${isOpen ? 'mr-3' : ''} text-lg`}>
      {icon}
    </div>
    {isOpen && <span className="font-medium">{label}</span>}
    {active && isOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black"></div>}
  </div>
);

const UserRow = ({ name, email, role, status, date }: { name: string, email: string, role: string, status: string, date: string }) => (
  <tr className="hover:bg-white/20 transition-colors cursor-pointer group">
    <td className="px-6 py-4">
      <div className="flex items-center">
        <div className="relative mr-4">
          <img
            src={`https://unavatar.io/${encodeURIComponent(email)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`}
            alt={name}
            className="w-10 h-10 rounded-full border border-white/30 object-cover shadow-md group-hover:scale-110 transition-transform duration-300"
          />
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white/50 shadow-sm ${status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
        </div>
        <span className="font-bold text-slate-800">{name}</span>
      </div>
    </td>
    <td className="px-6 py-4 text-gray-800">{email}</td>
    <td className="px-6 py-4">
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${role === 'Admin' ? 'bg-purple-500/10 text-purple-600 border-purple-200/30' : 'bg-slate-500/10 text-slate-600 border-slate-200/30'}`}>
        {role}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center">
        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
        <span className={`text-xs font-medium ${status === 'Active' ? 'text-slate-700' : 'text-slate-400'}`}>{status}</span>
      </div>
    </td>
    <td className="px-6 py-4 text-slate-500 text-xs">{date}</td>
  </tr>
);

export default AdminDashboard;
