const { models } = require('../config/database');
const bcrypt = require('bcrypt');

const seedAdminUser = async () => {
  try {
    console.log('🌱 Seeding admin user...');

    const adminRole = await models.Role.findOne({ where: { name: 'ADMIN' } });
    if (!adminRole) {
      throw new Error('Admin role not found. Please run role seeder first.');
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dashboardapp.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#';

    const [admin, created] = await models.User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        email: adminEmail,
        password: adminPassword,
        firstName: 'System',
        lastName: 'Administrator',
        roleId: adminRole.id,
        isVerified: true,
        isActive: true
      }
    });

    if (created) {
      console.log(`✅ Created admin user: ${admin.email}`);
      console.log(`🔑 Admin password: ${adminPassword}`);
    } else {
      console.log(`📋 Admin user already exists: ${admin.email}`);
    }

    console.log('✅ Admin user seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  }
};

module.exports = seedAdminUser;