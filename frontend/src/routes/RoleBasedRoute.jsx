import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

/**
 * Gatekeeper de Autorização (RBAC).
 */
const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = user?.role && allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;
