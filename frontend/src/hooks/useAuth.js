import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser, selectUserRole, selectUserPermissions } from '../redux/slices/authSlice';

export const useAuth = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const userPermissions = useSelector(selectUserPermissions);

  const hasRole = (roles) => {
    if (!userRole) return false;
    if (typeof roles === 'string') return userRole === roles;
    if (Array.isArray(roles)) return roles.includes(userRole);
    return false;
  };

  const hasPermission = (permission) => {
    if (!userPermissions) return false;
    return userPermissions[permission] === true;
  };

  const hasAnyPermission = (permissions) => {
    if (!userPermissions) return false;
    return permissions.some(permission => userPermissions[permission] === true);
  };

  const hasAllPermissions = (permissions) => {
    if (!userPermissions) return false;
    return permissions.every(permission => userPermissions[permission] === true);
  };

  return {
    isAuthenticated,
    user,
    userRole,
    userPermissions,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};