import React from 'react';
import { useSelector } from 'react-redux';
import { selectRecentActivity } from '../../redux/slices/dashboardSlice';
import { formatDistanceToNow } from 'date-fns';
import {
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  DocumentIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const RecentActivity = () => {
  const recentActivity = useSelector(selectRecentActivity);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration':
        return UserPlusIcon;
      case 'user_login':
        return ArrowRightOnRectangleIcon;
      case 'data_created':
        return DocumentIcon;
      case 'system_update':
        return Cog6ToothIcon;
      default:
        return DocumentIcon;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user_registration':
        return 'text-green-600 bg-green-100';
      case 'user_login':
        return 'text-blue-600 bg-blue-100';
      case 'data_created':
        return 'text-purple-600 bg-purple-100';
      case 'system_update':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white shadow-soft rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
          View all
        </button>
      </div>

      {!recentActivity || recentActivity.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
          <p className="mt-1 text-sm text-gray-500">
            Activity will appear here as users interact with the system.
          </p>
        </div>
      ) : (
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {recentActivity.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const isLast = index === recentActivity.length - 1;

              return (
                <li key={index}>
                  <div className="relative pb-8">
                    {!isLast && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityColor(
                            activity.type
                          )}`}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          {activity.metadata && (
                            <p className="text-xs text-gray-500">
                              {activity.metadata.email || activity.metadata.method}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;

