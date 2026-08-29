import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = ({
  children,
  requiredRole,
  redirectTo = '/login',
  fallbackRedirect,
}) => {
  const { user, isAuthenticated, loading, canContribute, canCreateChannel, canManageChannel, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#DD6B35] border-t-transparent" />
        <p className="text-xs text-[#4A392E]/70 font-medium">Verifying session permissions...</p>
      </div>
    );
  }

  // 1. Not logged in -> Redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // 2. If requiredRole is specified, verify user has AT LEAST the required permission
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Check if user role is in the allowed list or has admin override
    const hasPermission = isAdmin() || roles.includes(user.role) || (
      roles.includes('contributor') && canContribute()
    ) || (
      roles.includes('palkhi_pramukh') && canCreateChannel()
    );

    if (!hasPermission) {
      if (fallbackRedirect) {
        return <Navigate to={fallbackRedirect} state={{ from: location.pathname }} replace />;
      }

      // If route requires palkhi_pramukh permission
      if (roles.includes('palkhi_pramukh')) {
        return <Navigate to="/apply-palkhi-pramukh" state={{ from: location.pathname }} replace />;
      }

      // If route requires contributor permission
      if (roles.includes('contributor')) {
        return <Navigate to="/apply-contributor" state={{ from: location.pathname }} replace />;
      }

      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
