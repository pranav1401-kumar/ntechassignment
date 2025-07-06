export const API_ENDPOINTS = {
    // Auth endpoints
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    
    // OAuth endpoints
    GOOGLE_AUTH: '/auth/google',
    GITHUB_AUTH: '/auth/github',
    MICROSOFT_AUTH: '/auth/microsoft',
    
    // User endpoints
    USERS: '/users',
    USER_STATS: '/users/stats',
    USER_PROFILE: '/users/profile',
    
    // Dashboard endpoints
    DASHBOARD: '/dashboard',
    DASHBOARD_CHARTS: '/dashboard/charts',
    
    // Data endpoints
    DATA_TABLE: '/data/table',
    DATA_CATEGORIES: '/data/categories',
    DATA_STATISTICS: '/data/statistics',
    DATA_EXPORT: '/data/export',
    DATA_ENTRIES: '/data/entries',
  };
  
  export const ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    VIEWER: 'VIEWER',
  };
  
  export const PERMISSIONS = {
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
    SYSTEM_MANAGE: 'system.manage',
  };
  
  export const CHART_TYPES = {
    LINE: 'line',
    BAR: 'bar',
    PIE: 'pie',
    AREA: 'area',
    COLUMN: 'column',
    SPLINE: 'spline',
  };
  
  export const DATA_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    COMPLETED: 'completed',
  };
  
  export const PRIORITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  };
  
  export const OAUTH_PROVIDERS = {
    GOOGLE: 'google',
    GITHUB: 'github',
    MICROSOFT: 'microsoft',
    APPLE: 'apple',
  };
  
  export const LOCAL_STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_DATA: 'userData',
    THEME_PREFERENCE: 'themePreference',
    SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  };
  
  export const QUERY_KEYS = {
    CURRENT_USER: 'currentUser',
    DASHBOARD_DATA: 'dashboardData',
    USERS: 'users',
    USER_STATS: 'userStats',
    TABLE_DATA: 'tableData',
    DATA_CATEGORIES: 'dataCategories',
    DATA_STATISTICS: 'dataStatistics',
    CHARTS: 'charts',
  };
  
  export const PAGE_SIZES = [10, 25, 50, 100];
  
  export const DEFAULT_PAGE_SIZE = parseInt(process.env.REACT_APP_DEFAULT_PAGE_SIZE) || 10;
  
  export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_OTP: '/verify-otp',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    DASHBOARD: '/dashboard',
    USERS: '/users',
    PROFILE: '/profile',
    UNAUTHORIZED: '/unauthorized',
    NOT_FOUND: '/404',
    AUTH_CALLBACK: '/auth/callback',
  };