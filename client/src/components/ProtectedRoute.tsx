import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // Decode JWT to check role
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role;

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on their actual role
      return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
    }

    return <Outlet />;
  } catch {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
