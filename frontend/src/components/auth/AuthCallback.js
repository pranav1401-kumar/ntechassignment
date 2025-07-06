import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setTokens } from '../../redux/slices/authSlice';
import { ROUTES } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh');
        const error = searchParams.get('error');

        if (error) {
          toast.error('OAuth authentication failed');
          navigate(ROUTES.LOGIN);
          return;
        }

        if (token && refreshToken) {
          // Set tokens in Redux store
          dispatch(setTokens({ accessToken: token, refreshToken }));
          
          // Get user data will be handled by the app initialization
          toast.success('Login successful!');
          navigate(ROUTES.DASHBOARD);
        } else {
          toast.error('Invalid authentication response');
          navigate(ROUTES.LOGIN);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Authentication failed');
        navigate(ROUTES.LOGIN);
      }
    };

    handleOAuthCallback();
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">
          Completing authentication...
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please wait while we finish logging you in.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;