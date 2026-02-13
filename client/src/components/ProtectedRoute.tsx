import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole, DashboardType } from '../utils/rolePermissions';
import { canAccessDashboard, getDefaultDashboard } from '../utils/rolePermissions';
import { decodeJwt } from '../utils/jwtUtils';

const ProtectedRoute = ({ allowedRoles, requiredDashboard }: { allowedRoles?: UserRole[], requiredDashboard?: DashboardType }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // Decode JWT to check role using the robust utility
    const payload = decodeJwt(token);
    
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    const userRole = payload.role as UserRole;

    // Check role-based access
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // Redirect to their default dashboard
      const defaultPath = getDefaultDashboard(userRole);
      return <Navigate to={defaultPath} replace />;
    }

    // Check dashboard-specific access
    if (requiredDashboard && !canAccessDashboard(userRole, requiredDashboard)) {
      // Redirect to their default dashboard
      const defaultPath = getDefaultDashboard(userRole);
      return <Navigate to={defaultPath} replace />;
    }

    return <Outlet />;
  } catch {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
