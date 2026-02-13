import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiLayout, FiEdit3, FiFeather, FiShield, FiChevronDown } from 'react-icons/fi';
import type { UserRole } from '../utils/rolePermissions';
import { getNavigationItems, getRoleDisplayName } from '../utils/rolePermissions';
import { decodeJwt } from '../utils/jwtUtils';


const DashboardSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Get role from token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      const payload = decodeJwt(token);
      if (payload) {
        setUserRole(payload.role as UserRole);
      }
    }
  }, []);


  if (!userRole) return null;

  // STRICT RULE: Only 'admin' can switch dashboards
  if (userRole !== 'admin') return null;

  const navItems = getNavigationItems(userRole);
  
  // Don't show switcher if user only has access to one dashboard (safety check)
  if (navItems.length <= 1) return null;

  // Find current active dashboard
  const currentDashboard = navItems.find(item => location.pathname === item.path) || navItems[navItems.length - 1];

  const getIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <FiShield className="w-4 h-4" />;
      case 'author':
        return <FiFeather className="w-4 h-4" />;
      case 'editor':
        return <FiEdit3 className="w-4 h-4" />;
      case 'user':
      default:
        return <FiLayout className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/30 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/40 transition-all shadow-sm"
      >
        {getIcon(currentDashboard.role)}
        <span className="font-medium text-sm text-slate-800">{currentDashboard.name} Dashboard</span>
        <FiChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="p-3 border-b border-white/20 bg-white/30">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Workspace</p>
              <p className="text-sm text-slate-700 mt-1">{getRoleDisplayName(userRole)} • {navItems.length} Dashboards</p>
            </div>

            <div className="p-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start space-x-3 px-4 py-3 rounded-xl transition-all ${
                    location.pathname === item.path
                      ? 'bg-emerald-500/10 border border-emerald-500/20 shadow-sm'
                      : 'hover:bg-white/40'
                  }`}
                >
                  <div className={`mt-0.5 ${location.pathname === item.path ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {getIcon(item.role)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-semibold ${location.pathname === item.path ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {item.name} Dashboard
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                  {location.pathname === item.path && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5"></div>
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-white/20 bg-white/20">
              <p className="text-xs text-slate-500 text-center">
                Switch between your accessible dashboards
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardSwitcher;
