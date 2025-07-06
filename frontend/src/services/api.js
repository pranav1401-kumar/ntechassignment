import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store reference for interceptors
let store = null;
let isRefreshing = false;
let failedQueue = [];

// Function to set store reference
export const setStoreReference = (storeInstance) => {
  store = storeInstance;
  console.log('API store reference set');
};

// Process queued requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (store) {
      const state = store.getState();
      const token = state.auth.accessToken;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`Adding token to request: ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        console.log(`No token available for request: ${config.method?.toUpperCase()} ${config.url}`);
      }
    } else {
      console.warn('Store not available in API interceptor');
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (process.env.NODE_ENV === 'development') {
      const endTime = new Date();
      const duration = endTime - response.config.metadata.startTime;
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }
    
    const { status, data } = error.response;
    console.error(`API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - ${status}`, data);
    
    // Handle token expiration
    if (status === 401 && data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry && store) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const state = store.getState();
        const refreshToken = state.auth.refreshToken;
        
        if (refreshToken) {
          console.log('Attempting to refresh token...');
          // Attempt to refresh token
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          console.log('Token refreshed successfully');
          
          // Import the action dynamically to avoid circular dependency
          const { refreshTokens } = await import('../redux/slices/authSlice');
          
          // Update tokens in store
          store.dispatch(refreshTokens({
            accessToken,
            refreshToken: newRefreshToken
          }));
          
          // Process queued requests
          processQueue(null, accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('No refresh token available');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed, logout user
        processQueue(refreshError, null);
        const { logout } = await import('../redux/slices/authSlice');
        store.dispatch(logout());
        toast.error('Session expired. Please login again.');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle other authentication errors
    if (status === 401 && !originalRequest._retry && store) {
      console.log('Authentication failed, logging out user');
      const { logout } = await import('../redux/slices/authSlice');
      store.dispatch(logout());
      toast.error('Authentication required. Please login.');
    }
    
    // Handle authorization errors
    if (status === 403) {
      toast.error('You do not have permission to perform this action.');
    }
    
    // Handle server errors
    if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    // Handle validation errors
    if (status === 400 && data?.errors) {
      const errorMessages = data.errors.map(err => err.message).join(', ');
      toast.error(errorMessages);
    } else if (status === 400 && data?.message) {
      toast.error(data.message);
    }
    
    // Handle rate limiting
    if (status === 429) {
      toast.error('Too many requests. Please try again later.');
    }
    
    // Handle not found errors silently for favicon
    if (status === 404 && originalRequest.url?.includes('favicon')) {
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default api;