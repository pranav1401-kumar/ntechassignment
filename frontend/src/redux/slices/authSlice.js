import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

// Memory-based storage (since localStorage is not available in artifacts)
let memoryStorage = {
  accessToken: null,
  refreshToken: null,
  user: null
};

// Helper functions for memory storage
const getStoredToken = (key) => {
  return memoryStorage[key] || null;
};

const setStoredToken = (key, value) => {
  if (value) {
    memoryStorage[key] = value;
  } else {
    delete memoryStorage[key];
  }
};

const getStoredUser = () => {
  return memoryStorage.user || null;
};

const setStoredUser = (user) => {
  if (user) {
    memoryStorage.user = user;
  } else {
    delete memoryStorage.user;
  }
};

const clearMemoryStorage = () => {
  memoryStorage = {
    accessToken: null,
    refreshToken: null,
    user: null
  };
};

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOTP(otpData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.resendOTP(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend OTP');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return {};
    } catch (error) {
      // Even if logout API fails, we should clear memory storage
      return {};
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user data');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset email');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(resetData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(passwordData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password change failed');
    }
  }
);

// Initial state
const initialState = {
  user: getStoredUser(),
  accessToken: getStoredToken('accessToken'),
  refreshToken: getStoredToken('refreshToken'),
  isAuthenticated: !!getStoredToken('accessToken'),
  isLoading: false,
  error: null,
  pendingVerification: null, // { email, type } for OTP verification
  registrationStep: 'form', // 'form', 'otp', 'complete'
  loginStep: 'credentials', // 'credentials', 'otp', 'complete'
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.pendingVerification = null;
      state.registrationStep = 'form';
      state.loginStep = 'credentials';
      clearMemoryStorage();
    },
    setTokens: (state, action) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      setStoredToken('accessToken', accessToken);
      setStoredToken('refreshToken', refreshToken);
    },
    refreshTokens: (state, action) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      if (refreshToken) {
        state.refreshToken = refreshToken;
        setStoredToken('refreshToken', refreshToken);
      }
      setStoredToken('accessToken', accessToken);
    },
    setUser: (state, action) => {
      state.user = action.payload;
      setStoredUser(action.payload);
    },
    setPendingVerification: (state, action) => {
      state.pendingVerification = action.payload;
    },
    setRegistrationStep: (state, action) => {
      state.registrationStep = action.payload;
    },
    setLoginStep: (state, action) => {
      state.loginStep = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.pendingVerification = null;
      state.registrationStep = 'form';
      state.loginStep = 'credentials';
      clearMemoryStorage();
    },
  },
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success && action.payload.data) {
          state.pendingVerification = {
            email: action.payload.data.email,
            type: 'registration'
          };
          state.registrationStep = 'otp';
          toast.success('Registration successful! Please check your email for verification code.');
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.requiresOtp) {
          state.pendingVerification = {
            email: action.payload.data.email,
            type: 'login'
          };
          state.loginStep = 'otp';
          toast.success('Please check your email for verification code.');
        } else if (action.payload.requiresVerification) {
          state.pendingVerification = {
            email: action.payload.data.email,
            type: 'registration'
          };
          state.registrationStep = 'otp';
          toast.error(action.payload.message);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Verify OTP - KEY FIX: Properly handle the response structure
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        
        if (action.payload.success && action.payload.data) {
          const { user, tokens } = action.payload.data;
          
          if (tokens) {
            // Successful login after OTP verification
            state.user = user;
            state.accessToken = tokens.accessToken;
            state.refreshToken = tokens.refreshToken;
            state.isAuthenticated = true;
            state.pendingVerification = null;
            state.loginStep = 'complete';
            state.registrationStep = 'complete';
            
            // Store in memory
            setStoredToken('accessToken', tokens.accessToken);
            setStoredToken('refreshToken', tokens.refreshToken);
            setStoredUser(user);
            
            toast.success('Login successful!');
          } else {
            // Registration verification completed (no tokens returned)
            state.pendingVerification = null;
            state.registrationStep = 'complete';
            toast.success('Account verified successfully! Please login.');
          }
        }
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Resend OTP
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('OTP sent successfully!');
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
        toast.error(action.payload);
      })
      
      // Logout User
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.pendingVerification = null;
        state.registrationStep = 'form';
        state.loginStep = 'credentials';
        clearMemoryStorage();
        toast.success('Logged out successfully');
      })
      
      // Get Current User
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.user = action.payload.data;
          setStoredUser(action.payload.data);
        }
      })
      .addCase(getCurrentUser.rejected, (state) => {
        // If getting current user fails, logout
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        clearMemoryStorage();
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('Password reset link sent to your email');
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('Password reset successfully! Please login with your new password.');
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('Password changed successfully!');
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const {
  clearError,
  clearAuth,
  setTokens,
  refreshTokens,
  setUser,
  setPendingVerification,
  setRegistrationStep,
  setLoginStep,
  logout,
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectRefreshToken = (state) => state.auth.refreshToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role?.name;
export const selectUserPermissions = (state) => state.auth.user?.role?.permissions || {};
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectPendingVerification = (state) => state.auth.pendingVerification;
export const selectRegistrationStep = (state) => state.auth.registrationStep;
export const selectLoginStep = (state) => state.auth.loginStep;

export default authSlice.reducer;