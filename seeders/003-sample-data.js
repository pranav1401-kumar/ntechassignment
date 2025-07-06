const { models } = require('../config/database');

const seedSampleData = async () => {
  try {
    console.log('🌱 Seeding sample data...');

    // Sample chart data
    const chartData = [
      {
        type: 'line',
        title: 'User Growth Over Time',
        description: 'Monthly user registration trends',
        category: 'users',
        accessLevel: 'PUBLIC',
        data: {
          series: [{
            name: 'New Users',
            data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 85, 95]
          }],
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        config: {
          chart: { type: 'line' },
          title: { text: 'User Growth' },
          xAxis: { title: { text: 'Month' } },
          yAxis: { title: { text: 'Users' } }
        }
      },
      {
        type: 'pie',
        title: 'User Roles Distribution',
        description: 'Distribution of users by role',
        category: 'users',
        accessLevel: 'MANAGER',
        data: {
          series: [{
            name: 'Roles',
            data: [
              { name: 'Viewers', y: 61.41 },
              { name: 'Managers', y: 11.84 },
              { name: 'Admins', y: 26.75 }
            ]
          }]
        },
        config: {
          chart: { type: 'pie' },
          title: { text: 'User Roles' }
        }
      },
      {
        type: 'column',
        title: 'Login Activity',
        description: 'Daily login statistics',
        category: 'activity',
        accessLevel: 'MANAGER',
        data: {
          series: [{
            name: 'Successful Logins',
            data: [29, 71, 40, 28, 60, 45, 85]
          }, {
            name: 'Failed Logins',
            data: [3, 8, 5, 2, 7, 4, 12]
          }],
          categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        config: {
          chart: { type: 'column' },
          title: { text: 'Login Activity' },
          xAxis: { title: { text: 'Day' } },
          yAxis: { title: { text: 'Logins' } }
        }
      },
      {
        type: 'area',
        title: 'System Performance',
        description: 'Server response times and uptime',
        category: 'system',
        accessLevel: 'ADMIN',
        data: {
          series: [{
            name: 'Response Time (ms)',
            data: [150, 120, 180, 110, 160, 140, 130, 145, 155, 135]
          }],
          categories: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00']
        },
        config: {
          chart: { type: 'area' },
          title: { text: 'System Performance' },
          xAxis: { title: { text: 'Time' } },
          yAxis: { title: { text: 'Response Time (ms)' } }
        }
      }
    ];

    for (const chart of chartData) {
      const [chartEntry, created] = await models.ChartData.findOrCreate({
        where: { title: chart.title },
        defaults: chart
      });

      if (created) {
        console.log(`✅ Created chart: ${chart.title}`);
      }
    }

    // Sample data table entries
    const dataEntries = [
      {
        name: 'Q4 Revenue Target',
        description: 'Quarterly revenue goal for Q4 2025',
        value: 150000.00,
        category: 'finance',
        subcategory: 'revenue',
        status: 'active',
        priority: 'high',
        tags: ['quarterly', 'target', 'revenue'],
        metadata: { department: 'sales', quarter: 'Q4' },
        progress: 75,
        accessLevel: 'MANAGER'
      },
      {
        name: 'User Onboarding Process',
        description: 'Streamline the user registration and verification process',
        value: null,
        category: 'product',
        subcategory: 'ux',
        status: 'pending',
        priority: 'medium',
        tags: ['onboarding', 'ux', 'registration'],
        metadata: { assignee: 'product-team', estimate: '2 weeks' },
        progress: 30,
        accessLevel: 'PUBLIC'
      },
      {
        name: 'Security Audit 2025',
        description: 'Annual security audit and penetration testing',
        value: 25000.00,
        category: 'security',
        subcategory: 'audit',
        status: 'active',
        priority: 'critical',
        tags: ['security', 'audit', 'compliance'],
        metadata: { vendor: 'SecureAudit Corp', deadline: '2025-03-31' },
        progress: 10,
        accessLevel: 'ADMIN'
      },
      {
        name: 'Mobile App Development',
        description: 'Develop native mobile applications for iOS and Android',
        value: 80000.00,
        category: 'product',
        subcategory: 'development',
        status: 'active',
        priority: 'high',
        tags: ['mobile', 'ios', 'android', 'development'],
        metadata: { team: 'mobile-dev', startDate: '2025-01-15' },
        progress: 45,
        accessLevel: 'MANAGER'
      },
      {
        name: 'Customer Support Training',
        description: 'Quarterly training program for customer support team',
        value: 5000.00,
        category: 'hr',
        subcategory: 'training',
        status: 'completed',
        priority: 'medium',
        tags: ['training', 'support', 'quarterly'],
        metadata: { participants: 15, duration: '3 days' },
        progress: 100,
        accessLevel: 'PUBLIC'
      },
      {
        name: 'Database Optimization',
        description: 'Optimize database queries and improve performance',
        value: null,
        category: 'technical',
        subcategory: 'performance',
        status: 'active',
        priority: 'medium',
        tags: ['database', 'optimization', 'performance'],
        metadata: { impact: 'high', complexity: 'medium' },
        progress: 60,
        accessLevel: 'MANAGER'
      },
      {
        name: 'Marketing Campaign Q1',
        description: 'Digital marketing campaign for Q1 user acquisition',
        value: 35000.00,
        category: 'marketing',
        subcategory: 'campaign',
        status: 'pending',
        priority: 'high',
        tags: ['marketing', 'digital', 'acquisition'],
        metadata: { channels: ['social', 'email', 'ppc'], budget: 35000 },
        progress: 0,
        accessLevel: 'MANAGER'
      },
      {
        name: 'API Documentation Update',
        description: 'Update and improve API documentation with examples',
        value: null,
        category: 'technical',
        subcategory: 'documentation',
        status: 'active',
        priority: 'low',
        tags: ['api', 'documentation', 'developer'],
        metadata: { pages: 50, format: 'swagger' },
        progress: 80,
        accessLevel: 'PUBLIC'
      }
    ];

    for (const entry of dataEntries) {
      const [dataEntry, created] = await models.DataTable.findOrCreate({
        where: { name: entry.name },
        defaults: entry
      });

      if (created) {
        console.log(`✅ Created data entry: ${entry.name}`);
      }
    }

    console.log('✅ Sample data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    throw error;
  }
};

module.exports = seedSampleData;