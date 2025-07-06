const { sequelize } = require('../config/database');
const seedRoles = require('../seeders/001-roles');
const seedAdminUser = require('../seeders/002-admin-user');
const seedSampleData = require('../seeders/003-sample-data');

const runSeeders = async () => {
  try {
    console.log('🚀 Starting database seeding...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');

    // Run seeders in order
    await seedRoles();
    await seedAdminUser();
    await seedSampleData();

    console.log('🎉 All seeders completed successfully!');
    
    console.log('\n📋 Summary:');
    console.log('- Roles: ADMIN, MANAGER, VIEWER');
    console.log('- Admin user created');
    console.log('- Sample charts and data entries added');
    console.log('\n🔐 Default Admin Credentials:');
    console.log(`Email: ${process.env.ADMIN_EMAIL || 'admin@dashboardapp.com'}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'Admin123!@#'}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  runSeeders();
}

module.exports = runSeeders;
