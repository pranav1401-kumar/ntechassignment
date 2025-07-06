'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'ADMIN',
        display_name: 'Administrator',
        description: 'Full system access with all permissions',
        permissions: JSON.stringify({
          'user.create': true,
          'user.read': true,
          'user.update': true,
          'user.delete': true,
          'user.manage': true,
          'dashboard.read': true,
          'dashboard.write': true,
          'dashboard.admin': true,
          'data.read': true,
          'data.write': true,
          'data.delete': true,
          'analytics.read': true,
          'analytics.export': true,
          'system.manage': true,
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'MANAGER',
        display_name: 'Manager',
        description: 'Limited administrative access with data management capabilities',
        permissions: JSON.stringify({
          'user.read': true,
          'dashboard.read': true,
          'dashboard.write': true,
          'data.read': true,
          'data.write': true,
          'analytics.read': true,
          'analytics.export': true,
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'VIEWER',
        display_name: 'Viewer',
        description: 'Read-only access to dashboard and data',
        permissions: JSON.stringify({
          'dashboard.read': true,
          'data.read': true,
          'analytics.read': true,
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('roles', roles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};