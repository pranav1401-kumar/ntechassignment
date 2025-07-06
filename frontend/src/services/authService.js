import api from './api';

class AuthService {
  // Register new user
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  // Login with email and password
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  // Verify OTP
  async verifyOTP(otpData) {
    const response = await api.post('/auth/verify-otp', otpData);
    return response.data;
  }

  // Resend OTP
  async resendOTP(email) {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  }

  // Logout
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }

  // Get current user
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  // Forgot password
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  // Reset password
  async resetPassword(resetData) {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  }

  // Change password
  async changePassword(passwordData) {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  }

  // OAuth login URLs
  getOAuthLoginUrl(provider) {
    const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/api/auth/${provider}`;
  }
}

export default new AuthService();