import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData, selectDashboard } from '../../redux/slices/dashboardSlice';
import { selectUser, selectIsAuthenticated, selectAccessToken } from '../../redux/slices/authSlice';
import { ROLES } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';
import StatisticsCards from './StatisticsCards';
import Charts from './Charts';
import RecentActivity from './RecentActivity';
import DataTable from './DataTable';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSelector(selectDashboard);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);
  const userRole = user?.role?.name;

  useEffect(() => {
    // Only fetch dashboard data if user is authenticated and has access token
    if (isAuthenticated && accessToken && user) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, isAuthenticated, accessToken, user]);

  // Show loading while authentication state is being determined
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-gray-600">Loading user data...</p>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-error-800">
              Error loading dashboard
            </h3>
            <div className="mt-2 text-sm text-error-700">
              <p>{error}</p>
            </div>
            <div className="mt-3">
              <button
                type="button"
                className="bg-error-100 px-3 py-2 rounded-md text-sm font-medium text-error-800 hover:bg-error-200"
                onClick={() => dispatch(fetchDashboardData())}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getDashboardTitle = () => {
    switch (userRole) {
      case ROLES.ADMIN:
        return 'Admin Dashboard';
      case ROLES.MANAGER:
        return 'Manager Dashboard';
      case ROLES.VIEWER:
        return 'Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const handleRefresh = () => {
    if (isAuthenticated && accessToken) {
      dispatch(fetchDashboardData());
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {getDashboardTitle()}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.firstName}! Here's what's happening today.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <svg className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Charts />
        <RecentActivity />
      </div>

      {/* Data Table */}
      <DataTable />
    </div>
  );
};

export default Dashboard;