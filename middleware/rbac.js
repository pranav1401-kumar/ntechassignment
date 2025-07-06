const hasRole = (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
  
      if (!req.user.role) {
        return res.status(403).json({
          success: false,
          message: 'No role assigned'
        });
      }
  
      if (!roles.includes(req.user.role.name)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }
  
      next();
    };
  };
  
  // Permission-based access control
  const hasPermission = (permission) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
  
      if (!req.user.role || !req.user.role.permissions) {
        return res.status(403).json({
          success: false,
          message: 'No permissions assigned'
        });
      }
  
      if (!req.user.role.permissions[permission]) {
        return res.status(403).json({
          success: false,
          message: `Permission '${permission}' required`
        });
      }
  
      next();
    };
  };
  
  // Check if user has any of the specified permissions
  const hasAnyPermission = (...permissions) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
  
      if (!req.user.role || !req.user.role.permissions) {
        return res.status(403).json({
          success: false,
          message: 'No permissions assigned'
        });
      }
  
      const hasPermission = permissions.some(permission => 
        req.user.role.permissions[permission]
      );
  
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `One of these permissions required: ${permissions.join(', ')}`
        });
      }
  
      next();
    };
  };
  
  // Check if user has all specified permissions
  const hasAllPermissions = (...permissions) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
  
      if (!req.user.role || !req.user.role.permissions) {
        return res.status(403).json({
          success: false,
          message: 'No permissions assigned'
        });
      }
  
      const hasAllPermissions = permissions.every(permission => 
        req.user.role.permissions[permission]
      );
  
      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: `All these permissions required: ${permissions.join(', ')}`
        });
      }
  
      next();
    };
  };
  
  // Admin only middleware
  const adminOnly = hasRole('ADMIN');
  
  // Manager or Admin middleware
  const managerOrAdmin = hasRole('MANAGER', 'ADMIN');
  
  module.exports = {
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    adminOnly,
    managerOrAdmin,
  };