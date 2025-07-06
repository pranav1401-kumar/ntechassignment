
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const AppleStrategy = require('passport-apple');
const { models } = require('./database');

/**
 * OAuth2 Configuration for multiple providers
 * Updated to handle production and development environments correctly
 */

// Get the correct base URL for callbacks
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.BASE_URL || 'https://ntechassignment-production.up.railway.app';
  }
  return process.env.BASE_URL || 'http://localhost:5000';
};

const BASE_URL = getBaseUrl();
console.log('OAuth Base URL:', BASE_URL);

// Google OAuth2 Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const googleCallbackURL = `${BASE_URL}/api/auth/google/callback`;
  console.log('Google Callback URL:', googleCallbackURL);
  
  passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: googleCallbackURL,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth Profile:', {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName
      });

      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }

      // Check if user already exists
      let user = await models.User.findOne({
        where: { email },
        include: [{
          model: models.Role,
          as: 'role',
          attributes: ['name', 'permissions']
        }]
      });

      if (user) {
        // Update Google ID if not already set
        if (!user.googleId) {
          await user.update({
            googleId: profile.id,
            isVerified: true
          });
        }

        // Update last login
        await user.update({ lastLogin: new Date() });

        return done(null, user);
      }

      // Create new user
      const defaultRole = await models.Role.findOne({ where: { name: 'VIEWER' } });
      if (!defaultRole) {
        return done(new Error('Default role not found'), null);
      }

      const names = profile.displayName ? profile.displayName.split(' ') : ['', ''];
      const firstName = names[0] || profile.name?.givenName || 'User';
      const lastName = names.slice(1).join(' ') || profile.name?.familyName || '';

      user = await models.User.create({
        email,
        firstName,
        lastName: lastName || 'User',
        googleId: profile.id,
        isVerified: true,
        isActive: true,
        roleId: defaultRole.id,
        lastLogin: new Date(),
        password: null // OAuth users don't have passwords
      });

      // Fetch user with role for response
      const userWithRole = await models.User.findByPk(user.id, {
        include: [{
          model: models.Role,
          as: 'role',
          attributes: ['name', 'permissions']
        }]
      });

      return done(null, userWithRole);
    } catch (error) {
      console.error('Google OAuth Error:', error);
      return done(error, null);
    }
  }));
}

// GitHub OAuth2 Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  const githubCallbackURL = `${BASE_URL}/api/auth/github/callback`;
  console.log('GitHub Callback URL:', githubCallbackURL);
  
  passport.use('github', new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: githubCallbackURL,
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('GitHub OAuth Profile:', {
        id: profile.id,
        username: profile.username,
        email: profile.emails?.[0]?.value
      });

      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in GitHub profile'), null);
      }

      // Check if user already exists
      let user = await models.User.findOne({
        where: { email },
        include: [{
          model: models.Role,
          as: 'role',
          attributes: ['name', 'permissions']
        }]
      });

      if (user) {
        // Update GitHub ID if not already set
        if (!user.githubId) {
          await user.update({
            githubId: profile.id,
            isVerified: true
          });
        }

        // Update last login
        await user.update({ lastLogin: new Date() });

        return done(null, user);
      }

      // Create new user
      const defaultRole = await models.Role.findOne({ where: { name: 'VIEWER' } });
      if (!defaultRole) {
        return done(new Error('Default role not found'), null);
      }

      const names = profile.displayName ? profile.displayName.split(' ') : [profile.username || 'User', ''];
      const firstName = names[0] || 'User';
      const lastName = names.slice(1).join(' ') || 'User';

      user = await models.User.create({
        email,
        firstName,
        lastName,
        githubId: profile.id,
        isVerified: true,
        isActive: true,
        roleId: defaultRole.id,
        lastLogin: new Date(),
        password: null
      });

      // Fetch user with role for response
      const userWithRole = await models.User.findByPk(user.id, {
        include: [{
          model: models.Role,
          as: 'role',
          attributes: ['name', 'permissions']
        }]
      });

      return done(null, userWithRole);
    } catch (error) {
      console.error('GitHub OAuth Error:', error);
      return done(error, null);
    }
  }));
}

// Microsoft OAuth2 Strategy
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  const microsoftCallbackURL = `${BASE_URL}/api/auth/microsoft/callback`;
  console.log('Microsoft Callback URL:', microsoftCallbackURL);
  
  passport.use('microsoft', new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: microsoftCallbackURL,
    scope: ['user.read'],
    tenant: 'common' // Allow both personal and work accounts
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Microsoft OAuth Profile:', {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName
      });

      const email = profile.emails?.[0]?.value || profile._json?.mail || profile._json?.userPrincipalName;
      if (!email) {
        return done(new Error('No email found in Microsoft profile'), null);
      }

      // Check if user already exists
      let user = await models.User.findOne({
        where: { email },
        include: [{
          model: models.Role,
          as: 'role',
          attributes: ['name', 'permissions']
        }]
      });

      if (user) {
        // Update Microsoft ID if not already set
        if (!user.microsoftId) {
          await user.update({
            microsoftId: profile.id,
            isVerified: true
          });
        }

        // Update last login
        await user.update({ lastLogin: new Date() });

        return done(null, user);
      }

      // Create new user
      const defaultRole = await models.Role.findOne({ where: { name: 'VIEWER' } });
      if (!defaultRole) {
        return done(new Error('Default role not found'), null);
      }

      const firstName = profile.name?.givenName || profile._json?.givenName || 'User';
      const lastName = profile.name?.familyName || profile._json?.surname || 'User';

      user = await models.User.create({
        email,
        firstName,
        lastName,
        microsoftId: profile.id,
        isVerified: true,
        isActive: true,
        roleId: defaultRole.id,
        lastLogin: new Date(),
        password: null
      });

      // Fetch user with role for response
      const userWithRole = await models.User.findByPk(user.id, {
        include: [{
          model: models.Role,
          as: 'role',
          attributes: ['name', 'permissions']
        }]
      });

      return done(null, userWithRole);
    } catch (error) {
      console.error('Microsoft OAuth Error:', error);
      return done(error, null);
    }
  }));
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await models.User.findByPk(id, {
      include: [{
        model: models.Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }],
      attributes: { exclude: ['password', 'otp'] }
    });
    done(null, user);
  } catch (error) {
    console.error('Deserialize user error:', error);
    done(error, null);
  }
});

/**
 * Helper function to get OAuth login URL
 * @param {string} provider - OAuth provider name
 * @returns {string} OAuth login URL
 */
const getOAuthLoginUrl = (provider) => {
  return `${BASE_URL}/api/auth/${provider}`;
};

/**
 * Helper function to check if OAuth provider is configured
 * @param {string} provider - OAuth provider name
 * @returns {boolean} True if provider is configured
 */
const isProviderConfigured = (provider) => {
  switch (provider.toLowerCase()) {
    case 'google':
      return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    case 'github':
      return !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
    case 'microsoft':
      return !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
    case 'apple':
      return !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY);
    default:
      return false;
  }
};

/**
 * Get list of configured OAuth providers
 * @returns {Array} Array of configured provider names
 */
const getConfiguredProviders = () => {
  const providers = ['google', 'github', 'microsoft', 'apple'];
  return providers.filter(provider => isProviderConfigured(provider));
};

/**
 * OAuth configuration info for frontend
 * @returns {Object} OAuth configuration object
 */
const getOAuthConfig = () => {
  const configuredProviders = getConfiguredProviders();
  
  return {
    providers: configuredProviders,
    urls: configuredProviders.reduce((acc, provider) => {
      acc[provider] = getOAuthLoginUrl(provider);
      return acc;
    }, {}),
    baseUrl: BASE_URL,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  };
};

/**
 * Middleware to handle OAuth errors
 */
const handleOAuthError = (err, req, res, next) => {
  console.error('OAuth Error:', err);
  
  const errorMessage = err.message || 'OAuth authentication failed';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  // Redirect to frontend with error
  res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errorMessage)}`);
};

/**
 * Middleware to handle successful OAuth authentication
 */
const handleOAuthSuccess = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      throw new Error('No user data received from OAuth provider');
    }

    // Generate JWT tokens
    const tokenService = require('../services/tokenService');
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role.name
    };

    const { accessToken, refreshToken } = tokenService.generateTokens(payload);
    
    // Save refresh token
    await tokenService.saveRefreshToken(user.id, refreshToken);

    // Log successful OAuth login
    if (models.LoginLog) {
      await models.LoginLog.create({
        userId: user.id,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        loginMethod: req.route?.path?.includes('google') ? 'google' : 
                     req.route?.path?.includes('github') ? 'github' :
                     req.route?.path?.includes('microsoft') ? 'microsoft' :
                     req.route?.path?.includes('apple') ? 'apple' : 'oauth',
        success: true
      });
    }

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}`;
    
    console.log('OAuth Success - Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth success handler error:', error);
    handleOAuthError(error, req, res);
  }
};

module.exports = {
  passport,
  getOAuthLoginUrl,
  isProviderConfigured,
  getConfiguredProviders,
  getOAuthConfig,
  handleOAuthError,
  handleOAuthSuccess,
  BASE_URL
};
