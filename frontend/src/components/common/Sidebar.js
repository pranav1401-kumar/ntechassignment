import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HomeIcon,
  ChartBarIcon,
  TableCellsIcon,
  UsersIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { selectUser } from '../../redux/slices/authSlice';
import { ROUTES, ROLES } from '../../utils/constants';
import classNames from 'classnames';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const userRole = user?.role?.name;

  const navigation = [
    {
      name: 'Dashboard',
      href: ROUTES.DASHBOARD,
      icon: HomeIcon,
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
    },
    {
      name: 'Data Tables',
      href: '/data-tables',
      icon: TableCellsIcon,
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER],
    },
    {
      name: 'User Management',
      href: ROUTES.USERS,
      icon: UsersIcon,
      roles: [ROLES.ADMIN],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      roles: [ROLES.ADMIN, ROLES.MANAGER],
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  const handleNavigation = (href) => {
    console.log('Navigating to:', href); // Debug log
    navigate(href);
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:z-40">
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 shadow-lg">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-5 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-900">Dashboard</h2>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleNavigation(item.href)}
                  className={classNames(
                    'w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent hover:border-gray-200'
                  )}
                  style={{ 
                    pointerEvents: 'auto',
                    touchAction: 'manipulation'
                  }}
                >
                  <item.icon
                    className={classNames(
                      'mr-3 flex-shrink-0 h-5 w-5 transition-colors',
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* User Profile */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
              <span className="text-sm font-semibold text-white">
                {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                {user?.lastName?.charAt(0)?.toUpperCase() || ''}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {user?.role?.name?.toLowerCase() || 'user'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;