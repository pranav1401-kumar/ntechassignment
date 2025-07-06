// scripts/setupDatabase.js
const { sequelize } = require('../config/database');
const seedRoles = require('../seeders/001-roles');
const seedAdminUser = require('../seeders/002-admin-user');
const seedSampleData = require('../seeders/003-sample-data');

const setupDatabase = async () => {
  try {
    console.log('🚀 Starting database setup...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync database (create tables)
    console.log('📋 Creating database tables...');
    await sequelize.sync({ force: true }); // This will drop and recreate all tables
    console.log('✅ Database tables created');

    // Run seeders in order
    console.log('🌱 Seeding database...');
    await seedRoles();
    await seedAdminUser();
    await seedSampleData();

    console.log('🎉 Database setup completed successfully!');
    
    console.log('\n📋 Summary:');
    console.log('- Tables created and synchronized');
    console.log('- Roles: ADMIN, MANAGER, VIEWER');
    console.log('- Admin user created');
    console.log('- Sample charts and data entries added');
    console.log('\n🔐 Default Admin Credentials:');
    console.log(`Email: ${process.env.ADMIN_EMAIL || 'admin@dashboardapp.com'}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'Admin123!@#'}`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;