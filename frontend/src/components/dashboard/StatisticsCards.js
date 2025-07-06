import React from 'react';
import { useSelector } from 'react-redux';
import { selectStatistics } from '../../redux/slices/dashboardSlice';
import { selectUser } from '../../redux/slices/authSlice';
import { ROLES } from '../../utils/constants';
import {
  UsersIcon,
  ChartBarIcon,
  TableCellsIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';

const StatisticsCards = () => {
  const statistics = useSelector(selectStatistics);
  const user = useSelector(selectUser);
  const userRole = user?.role?.name;

  const getStatsForRole = () => {
    const baseStats = [
      {
        id: 'data_total',
        name: 'Total Records',
        value: statistics?.data?.total || 0,
        change: '+12%',
        changeType: 'increase',
        icon: TableCellsIcon,
        description: 'Total data entries',
      },
    ];

    if ([ROLES.ADMIN, ROLES.MANAGER].includes(userRole)) {
      baseStats.unshift(
        {
          id: 'users_total',
          name: 'Total Users',
          value: statistics?.users?.total || 0,
          change: `+${statistics?.users?.new || 0}`,
          changeType: 'increase',
          icon: UsersIcon,
          description: 'Registered users',
        },
        {
          id: 'users_active',
          name: 'Active Users',
          value: statistics?.users?.active || 0,
          change: '+2.5%',
          changeType: 'increase',
          icon: ChartBarIcon,
          description: 'Currently active',
        }
      );
    }

    if (userRole === ROLES.ADMIN) {
      baseStats.push({
        id: 'system_calls',
        name: 'API Calls',
        value: statistics?.system?.apiCalls || 0,
        change: '+5.1%',
        changeType: 'increase',
        icon: ServerIcon,
        description: 'Last 24 hours',
      });
    }

    return baseStats;
  };

  const stats = getStatsForRole();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.id} className="bg-white overflow-hidden shadow-soft rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </div>
                    <div
                      className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.changeType === 'increase' ? (
                        <svg
                          className="self-center flex-shrink-0 h-3 w-3 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="self-center flex-shrink-0 h-3 w-3 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span className="sr-only">
                        {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                      </span>
                      {stat.change}
                    </div>
                  </dd>
                  <dd className="text-sm text-gray-500 mt-1">{stat.description}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;