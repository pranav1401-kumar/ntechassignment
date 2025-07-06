import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectUser } from '../../redux/slices/authSlice';
import { ROUTES } from '../../utils/constants';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, roles = [], requireAuth = true }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const location = useLocation();

  // Show loading if we're checking authentication
  if (requireAuth && isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles.length > 0 && user) {
    const userRole = user.role?.name;
    if (!roles.includes(userRole)) {
      return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;