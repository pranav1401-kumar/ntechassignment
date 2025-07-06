import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dataService from '../../services/dataService';
import toast from 'react-hot-toast';

// Async thunks
export const fetchTableData = createAsyncThunk(
  'data/fetchTableData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dataService.getTableData(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch table data');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'data/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dataService.getCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchDataStatistics = createAsyncThunk(
  'data/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dataService.getStatistics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

export const exportData = createAsyncThunk(
  'data/exportData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dataService.exportData(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export data');
    }
  }
);

export const createDataEntry = createAsyncThunk(
  'data/createEntry',
  async (entryData, { rejectWithValue }) => {
    try {
      const response = await dataService.createEntry(entryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create entry');
    }
  }
);

export const updateDataEntry = createAsyncThunk(
  'data/updateEntry',
  async ({ id, entryData }, { rejectWithValue }) => {
    try {
      const response = await dataService.updateEntry(id, entryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update entry');
    }
  }
);

export const deleteDataEntry = createAsyncThunk(
  'data/deleteEntry',
  async (id, { rejectWithValue }) => {
    try {
      await dataService.deleteEntry(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete entry');
    }
  }
);

// Initial state
const initialState = {
  tableData: null,
  categories: [],
  statistics: null,
  pagination: null,
  isLoading: false,
  error: null,
};

// Data slice
const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTableData: (state) => {
      state.tableData = null;
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Table Data
      .addCase(fetchTableData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTableData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tableData = action.payload;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTableData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      
      // Fetch Statistics
      .addCase(fetchDataStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      })
      
      // Export Data
      .addCase(exportData.fulfilled, (state) => {
        toast.success('Data exported successfully!');
      })
      .addCase(exportData.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Create Entry
      .addCase(createDataEntry.fulfilled, (state, action) => {
        if (state.tableData && state.tableData.items) {
          state.tableData.items.unshift(action.payload);
        }
        toast.success('Entry created successfully!');
      })
      .addCase(createDataEntry.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Update Entry
      .addCase(updateDataEntry.fulfilled, (state, action) => {
        if (state.tableData && state.tableData.items) {
          const index = state.tableData.items.findIndex(item => item.id === action.payload.id);
          if (index !== -1) {
            state.tableData.items[index] = action.payload;
          }
        }
        toast.success('Entry updated successfully!');
      })
      .addCase(updateDataEntry.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Delete Entry
      .addCase(deleteDataEntry.fulfilled, (state, action) => {
        if (state.tableData && state.tableData.items) {
          state.tableData.items = state.tableData.items.filter(item => item.id !== action.payload);
        }
        toast.success('Entry deleted successfully!');
      })
      .addCase(deleteDataEntry.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearError, clearTableData } = dataSlice.actions;

// Selectors
export const selectData = (state) => state.data;
export const selectTableData = (state) => state.data.tableData;
export const selectCategories = (state) => state.data.categories;
export const selectDataStatistics = (state) => state.data.statistics;
export const selectDataPagination = (state) => state.data.pagination;
export const selectDataLoading = (state) => state.data.isLoading;
export const selectDataError = (state) => state.data.error;

export default dataSlice.reducer;