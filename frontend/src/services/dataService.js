// src/services/dataService.js
import api from './api';

class DataService {
  // Get table data with pagination
  async getTableData(params = {}) {
    const response = await api.get('/data/table', { params });
    return response.data;
  }

  // Get data categories
  async getCategories() {
    const response = await api.get('/data/categories');
    return response.data;
  }

  // Get data statistics (Manager/Admin only)
  async getStatistics() {
    const response = await api.get('/data/statistics');
    return response.data;
  }

  // Export data (Manager/Admin only)
  async exportData(params = {}) {
    const response = await api.get('/data/export', { 
      params,
      responseType: params.format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  }

  // Create data entry (Manager/Admin only)
  async createEntry(entryData) {
    const response = await api.post('/data/entries', entryData);
    return response.data;
  }

  // Update data entry (Manager/Admin only)
  async updateEntry(id, entryData) {
    const response = await api.put(`/data/entries/${id}`, entryData);
    return response.data;
  }

  // Delete data entry (Admin only)
  async deleteEntry(id) {
    const response = await api.delete(`/data/entries/${id}`);
    return response.data;
  }

  // Bulk update entries (Admin only)
  async bulkUpdateEntries(bulkData) {
    const response = await api.put('/data/entries/bulk', bulkData);
    return response.data;
  }
}

export default new DataService();