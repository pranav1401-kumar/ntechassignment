import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';
import toast from 'react-hot-toast';

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getDashboardData();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchChartsByCategory = createAsyncThunk(
  'dashboard/fetchChartsByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getChartsByCategory(category);
      return { category, charts: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch charts');
    }
  }
);

export const createChart = createAsyncThunk(
  'dashboard/createChart',
  async (chartData, { rejectWithValue }) => {
    try {
      const response = await dashboardService.createChart(chartData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create chart');
    }
  }
);

export const updateChart = createAsyncThunk(
  'dashboard/updateChart',
  async ({ id, chartData }, { rejectWithValue }) => {
    try {
      const response = await dashboardService.updateChart(id, chartData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update chart');
    }
  }
);

export const deleteChart = createAsyncThunk(
  'dashboard/deleteChart',
  async (id, { rejectWithValue }) => {
    try {
      await dashboardService.deleteChart(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete chart');
    }
  }
);

// Initial state
const initialState = {
  data: null,
  charts: [],
  chartsByCategory: {},
  statistics: {},
  recentActivity: [],
  userRole: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.data = null;
      state.charts = [];
      state.chartsByCategory = {};
      state.statistics = {};
      state.recentActivity = [];
      state.userRole = null;
      state.error = null;
      state.lastUpdated = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.charts = action.payload.charts || [];
        state.statistics = action.payload.statistics || {};
        state.recentActivity = action.payload.recentActivity || [];
        state.userRole = action.payload.userRole;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Fetch Charts by Category
      .addCase(fetchChartsByCategory.fulfilled, (state, action) => {
        const { category, charts } = action.payload;
        state.chartsByCategory[category] = charts;
      })
      
      // Create Chart
      .addCase(createChart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createChart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.charts.push(action.payload);
        toast.success('Chart created successfully!');
      })
      .addCase(createChart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Update Chart
      .addCase(updateChart.fulfilled, (state, action) => {
        const index = state.charts.findIndex(chart => chart.id === action.payload.id);
        if (index !== -1) {
          state.charts[index] = action.payload;
        }
        toast.success('Chart updated successfully!');
      })
      .addCase(updateChart.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Delete Chart
      .addCase(deleteChart.fulfilled, (state, action) => {
        state.charts = state.charts.filter(chart => chart.id !== action.payload);
        toast.success('Chart deleted successfully!');
      })
      .addCase(deleteChart.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearDashboard, clearError, updateStatistics } = dashboardSlice.actions;

// Selectors
export const selectDashboard = (state) => state.dashboard;
export const selectDashboardData = (state) => state.dashboard.data;
export const selectCharts = (state) => state.dashboard.charts;
export const selectChartsByCategory = (state) => state.dashboard.chartsByCategory;
export const selectStatistics = (state) => state.dashboard.statistics;
export const selectRecentActivity = (state) => state.dashboard.recentActivity;
export const selectDashboardLoading = (state) => state.dashboard.isLoading;
export const selectDashboardError = (state) => state.dashboard.error;

export default dashboardSlice.reducer;