import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Redux
import { 
  getCurrentUser, 
  selectIsAuthenticated, 
  selectUser, 
  selectAccessToken,
  logout 
} from './redux/slices/authSlice';

// API Setup
import { setStoreReference } from './services/api';
import { store } from './redux/store';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OTPVerification from './components/auth/OTPVerification';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AuthCallback from './components/auth/AuthCallback';

// Dashboard Pages
import Dashboard from './components/dashboard/Dashboard';
import UserManagement from './components/users/UserManagement';
import Profile from './components/profile/Profile';

// Error Pages
import NotFound from './components/errors/NotFound';
import Unauthorized from './components/errors/Unauthorized';

// Constants
import { ROUTES, ROLES } from './utils/constants';

// Styles
import './App.css';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const accessToken = useSelector(selectAccessToken);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [hasSetupApi, setHasSetupApi] = React.useState(false);

  // Setup API store reference once
  useEffect(() => {
    if (!hasSetupApi) {
      setStoreReference(store);
      setHasSetupApi(true);
    }
  }, [hasSetupApi]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Only try to get current user if we have a token and are authenticated
        if (isAuthenticated && accessToken && !user) {
          console.log('Getting current user with token:', accessToken?.substring(0, 20) + '...');
          await dispatch(getCurrentUser()).unwrap();
        }
      } catch (error) {
        console.error('Failed to get current user during initialization:', error);
        // If we can't get the current user, logout to clear invalid state
        dispatch(logout());
      } finally {
        setIsInitializing(false);
      }
    };

    // Only initialize after API is set up
    if (hasSetupApi) {
      initializeApp();
    }
  }, [dispatch, isAuthenticated, accessToken, user, hasSetupApi]);

  // Show loading spinner while initializing
  if (isInitializing || !hasSetupApi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-sm text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path={ROUTES.LOGIN} 
              element={
                isAuthenticated ? (
                  <Navigate to={ROUTES.DASHBOARD} replace />
                ) : (
                  <Login />
                )
              } 
            />
            <Route 
              path={ROUTES.REGISTER} 
              element={
                isAuthenticated ? (
                  <Navigate to={ROUTES.DASHBOARD} replace />
                ) : (
                  <Register />
                )
              } 
            />
            <Route 
              path={ROUTES.VERIFY_OTP} 
              element={<OTPVerification />} 
            />
            <Route 
              path={ROUTES.FORGOT_PASSWORD} 
              element={<ForgotPassword />} 
            />
            <Route 
              path={ROUTES.RESET_PASSWORD} 
              element={<ResetPassword />} 
            />
            <Route 
              path={ROUTES.AUTH_CALLBACK} 
              element={<AuthCallback />} 
            />

            {/* Protected Routes */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.USERS}
              element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.PROFILE}
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                      <p className="mt-2 text-gray-600">Advanced analytics coming soon...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/data-tables"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900">Data Tables</h2>
                      <p className="mt-2 text-gray-600">Advanced data tables coming soon...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN, ROLES.MANAGER]}>
                  <Layout>
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                      <p className="mt-2 text-gray-600">Settings panel coming soon...</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Error Routes */}
            <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
            <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />

            {/* Default Routes */}
            <Route 
              path={ROUTES.HOME} 
              element={
                <Navigate 
                  to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} 
                  replace 
                />
              } 
            />
            <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;