module.exports = {
    ROLES: {
      ADMIN: 'ADMIN',
      MANAGER: 'MANAGER',
      VIEWER: 'VIEWER'
    },
    
    PERMISSIONS: {
      USER_CREATE: 'user.create',
      USER_READ: 'user.read',
      USER_UPDATE: 'user.update',
      USER_DELETE: 'user.delete',
      USER_MANAGE: 'user.manage',
      DASHBOARD_READ: 'dashboard.read',
      DASHBOARD_WRITE: 'dashboard.write',
      DASHBOARD_ADMIN: 'dashboard.admin',
      DATA_READ: 'data.read',
      DATA_WRITE: 'data.write',
      DATA_DELETE: 'data.delete',
      ANALYTICS_READ: 'analytics.read',
      ANALYTICS_EXPORT: 'analytics.export',
      SYSTEM_MANAGE: 'system.manage'
    },
  
    CHART_TYPES: {
      LINE: 'line',
      BAR: 'bar',
      PIE: 'pie',
      AREA: 'area',
      COLUMN: 'column',
      SPLINE: 'spline'
    },
  
    DATA_STATUS: {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      PENDING: 'pending',
      COMPLETED: 'completed'
    },
  
    PRIORITY_LEVELS: {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    },
  
    ACCESS_LEVELS: {
      PUBLIC: 'PUBLIC',
      MANAGER: 'MANAGER',
      ADMIN: 'ADMIN'
    },
  
    LOGIN_METHODS: {
      EMAIL: 'email',
      GOOGLE: 'google',
      GITHUB: 'github',
      MICROSOFT: 'microsoft',
      APPLE: 'apple'
    },
  
    OTP_TYPES: {
      REGISTRATION: 'registration',
      LOGIN: 'login',
      PASSWORD_RESET: 'password_reset'
    },
  
    EMAIL_TEMPLATES: {
      OTP_VERIFICATION: 'otp_verification',
      WELCOME: 'welcome',
      PASSWORD_RESET: 'password_reset'
    }
  };