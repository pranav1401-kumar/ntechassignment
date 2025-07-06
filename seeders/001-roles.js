const { models } = require('../config/database');

const seedRoles = async () => {
  try {
    console.log('🌱 Seeding roles...');

    const roles = [
      {
        name: 'ADMIN',
        displayName: 'Administrator',
        description: 'Full system access with all permissions',
        permissions: {
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
        }
      },
      {
        name: 'MANAGER',
        displayName: 'Manager',
        description: 'Limited administrative access with data management capabilities',
        permissions: {
          'user.read': true,
          'dashboard.read': true,
          'dashboard.write': true,
          'data.read': true,
          'data.write': true,
          'analytics.read': true,
          'analytics.export': true,
        }
      },
      {
        name: 'VIEWER',
        displayName: 'Viewer',
        description: 'Read-only access to dashboard and data',
        permissions: {
          'dashboard.read': true,
          'data.read': true,
          'analytics.read': true,
        }
      }
    ];

    for (const roleData of roles) {
      const [role, created] = await models.Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });

      if (created) {
        console.log(`✅ Created role: ${role.name}`);
      } else {
        console.log(`📋 Role already exists: ${role.name}`);
      }
    }

    console.log('✅ Roles seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  }
};

module.exports = seedRoles;