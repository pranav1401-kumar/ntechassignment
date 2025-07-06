// scripts/completeSetup.js
const createDatabase = require('./createDatabase');
const setupDatabase = require('./setupDatabase');

const completeSetup = async () => {
  try {
    console.log('🚀 Starting complete database setup...\n');
    
    // Step 1: Create database
    await createDatabase();
    
    console.log(''); // Empty line for better readability
    
    // Step 2: Setup tables and seed data
    await setupDatabase();
    
  } catch (error) {
    console.error('❌ Complete setup failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  completeSetup();
}

module.exports = completeSetup;