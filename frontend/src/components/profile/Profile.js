import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { selectUser } from '../../redux/slices/authSlice';
import { updateUserProfile } from '../../redux/slices/userSlice';
import { changePassword } from '../../redux/slices/authSlice';
import Button from '../common/Button';
import Input from '../common/Input';
import { UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch,
    reset: resetPasswordForm,
  } = useForm();

  const newPassword = watch('newPassword');

  const onProfileSubmit = (data) => {
    dispatch(updateUserProfile(data));
  };

  const onPasswordSubmit = async (data) => {
    try {
      await dispatch(changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })).unwrap();
      resetPasswordForm();
    } catch (error) {
      // Error handled by Redux
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'password', name: 'Password', icon: KeyIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Profile Settings
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-soft rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  {...registerProfile('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters',
                    },
                  })}
                  error={profileErrors.firstName?.message}
                />

                <Input
                  label="Last Name"
                  {...registerProfile('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters',
                    },
                  })}
                  error={profileErrors.lastName?.message}
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                disabled
                {...registerProfile('email')}
                helpText="Email cannot be changed. Contact support if needed."
              />

              <Input
                label="Phone Number"
                type="tel"
                {...registerProfile('phoneNumber', {
                  pattern: {
                    value: /^\+?[\d\s-()]+$/,
                    message: 'Invalid phone number format',
                  },
                })}
                error={profileErrors.phoneNumber?.message}
                helpText="Enter your phone number with country code if applicable."
              />

              <div className="flex justify-end">
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
              <Input
                label="Current Password"
                type="password"
                autoComplete="current-password"
                {...registerPassword('currentPassword', {
                  required: 'Current password is required',
                })}
                error={passwordErrors.currentPassword?.message}
              />

              <Input
                label="New Password"
                type="password"
                autoComplete="new-password"
                {...registerPassword('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain uppercase, lowercase, number and special character',
                  },
                })}
                error={passwordErrors.newPassword?.message}
                helpText="Password must be at least 8 characters with uppercase, lowercase, number and special character."
              />

              <Input
                label="Confirm New Password"
                type="password"
                autoComplete="new-password"
                {...registerPassword('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (value) => value === newPassword || 'Passwords do not match',
                })}
                error={passwordErrors.confirmPassword?.message}
              />

              <div className="flex justify-end">
                <Button type="submit" variant="primary">
                  Change Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;