// src/services/dashboardService.js
import api from './api';

class DashboardService {
  // Get dashboard data
  async getDashboardData() {
    const response = await api.get('/dashboard');
    return response.data;
  }

  // Get charts by category
  async getChartsByCategory(category) {
    const response = await api.get(`/dashboard/charts/${category}`);
    return response.data;
  }

  // Create new chart (Manager/Admin only)
  async createChart(chartData) {
    const response = await api.post('/dashboard/charts', chartData);
    return response.data;
  }

  // Update chart (Manager/Admin only)
  async updateChart(id, chartData) {
    const response = await api.put(`/dashboard/charts/${id}`, chartData);
    return response.data;
  }

  // Delete chart (Admin only)
  async deleteChart(id) {
    const response = await api.delete(`/dashboard/charts/${id}`);
    return response.data;
  }
}

export default new DashboardService();

