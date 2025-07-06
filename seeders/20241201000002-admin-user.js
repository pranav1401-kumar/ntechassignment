'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'Admin123!@#',
      12
    );

    const adminUser = {
      id: '550e8400-e29b-41d4-a716-446655440010',
      email: process.env.ADMIN_EMAIL || 'admin@dashboardapp.com',
      password: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      role_id: '550e8400-e29b-41d4-a716-446655440001', // ADMIN role ID
      is_verified: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await queryInterface.bulkInsert('users', [adminUser], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: process.env.ADMIN_EMAIL || 'admin@dashboardapp.com'
    }, {});
  }
};

// seeders/20241201000003-sample-chart-data.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const chartData = [
      {
        id: '550e8400-e29b-41d4-a716-446655440020',
        type: 'line',
        title: 'User Growth Over Time',
        description: 'Monthly user registration trends',
        category: 'users',
        access_level: 'PUBLIC',
        data: JSON.stringify({
          series: [{
            name: 'New Users',
            data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 85, 95]
          }],
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }),
        config: JSON.stringify({
          chart: { type: 'line' },
          title: { text: 'User Growth' },
          xAxis: { title: { text: 'Month' } },
          yAxis: { title: { text: 'Users' } }
        }),
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440021',
        type: 'pie',
        title: 'User Roles Distribution',
        description: 'Distribution of users by role',
        category: 'users',
        access_level: 'MANAGER',
        data: JSON.stringify({
          series: [{
            name: 'Roles',
            data: [
              { name: 'Viewers', y: 61.41 },
              { name: 'Managers', y: 11.84 },
              { name: 'Admins', y: 26.75 }
            ]
          }]
        }),
        config: JSON.stringify({
          chart: { type: 'pie' },
          title: { text: 'User Roles' }
        }),
        is_active: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440022',
        type: 'column',
        title: 'Login Activity',
        description: 'Daily login statistics',
        category: 'activity',
        access_level: 'MANAGER',
        data: JSON.stringify({
          series: [{
            name: 'Successful Logins',
            data: [29, 71, 40, 28, 60, 45, 85]
          }, {
            name: 'Failed Logins',
            data: [3, 8, 5, 2, 7, 4, 12]
          }],
          categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }),
        config: JSON.stringify({
          chart: { type: 'column' },
          title: { text: 'Login Activity' },
          xAxis: { title: { text: 'Day' } },
          yAxis: { title: { text: 'Logins' } }
        }),
        is_active: true,
        sort_order: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('chart_data', chartData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('chart_data', null, {});
  }
};