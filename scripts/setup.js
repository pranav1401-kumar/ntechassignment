const fs = require('fs');
const path = require('path');

const createEnvFile = () => {
  const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dashboard_db
DB_USER=root
DB_PASSWORD=your_password
DB_DIALECT=mysql

# JWT Configuration
JWT_SECRET=${require('crypto').randomBytes(64).toString('hex')}
JWT_REFRESH_SECRET=${require('crypto').randomBytes(64).toString('hex')}
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# OAuth2 Configuration
# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth2
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Microsoft OAuth2
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# Apple OAuth2
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Security
BCRYPT_ROUNDS=12
OTP_EXPIRY_MINUTES=5

# Admin User (for seeding)
ADMIN_EMAIL=admin@dashboardapp.com
ADMIN_PASSWORD=Admin123!@#

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# File Upload
MAX_FILE_SIZE=10485760
`;

  const envPath = path.join(__dirname, '../.env');
  
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully');
    console.log('🔧 Please update the configuration values in .env file');
  } else {
    console.log('📋 .env file already exists');
  }
};

const createGitignore = () => {
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Build files
build/
dist/

# Temporary files
tmp/
temp/

# Database files
*.sqlite
*.db

# Uploads
uploads/

# SSL certificates
*.pem
*.key
*.crt
`;

  const gitignorePath = path.join(__dirname, '../.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ .gitignore file created successfully');
  } else {
    console.log('📋 .gitignore file already exists');
  }
};

const setupProject = () => {
  console.log('🚀 Setting up Dashboard Backend...');
  
  createEnvFile();
  createGitignore();
  
  console.log('\n📦 Next steps:');
  console.log('1. Update .env file with your configuration');
  console.log('2. Install dependencies: npm install');
  console.log('3. Set up MySQL database');
  console.log('4. Run seeders: npm run seed');
  console.log('5. Start development server: npm run dev');
  console.log('\n✨ Happy coding!');
};

// Run if called directly
if (require.main === module) {
  setupProject();
}

module.exports = setupProject;