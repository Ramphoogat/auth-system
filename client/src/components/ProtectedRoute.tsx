import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '../utils/rolePermissions';
import { decodeJwt } from '../utils/jwtUtils';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: UserRole[] }) => {
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
      return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
  } catch {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
