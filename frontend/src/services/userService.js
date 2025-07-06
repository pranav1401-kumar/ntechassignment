import api from './api';

class UserService {
  // Get all users (Admin only)
  async getUsers(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  }

  // Get user by ID
  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  // Update user profile
  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  }

  // Update user (Admin only)
  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  }

  // Delete user (Admin only)
  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }

  // Get user statistics (Admin only)
  async getUserStats() {
    const response = await api.get('/users/stats');
    return response.data;
  }
}

export default new UserService();

