// config/auth.js (Updated version)
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { models } = require('./database');

// Import OAuth configuration
require('./oauth');

// JWT Strategy for API authentication
passport.use('jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256']
}, async (payload, done) => {
  try {
    // Validate payload structure
    if (!payload.userId) {
      return done(null, false, { message: 'Invalid token payload' });
    }

    // Find user with role information
    const user = await models.User.findByPk(payload.userId, {
      include: [{
        model: models.Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }],
      attributes: { exclude: ['password', 'otp', 'refreshToken'] }
    });

    if (!user) {
      return done(null, false, { message: 'User not found' });
    }

    // Check if user account is active
    if (!user.isActive) {
      return done(null, false, { message: 'Account is deactivated' });
    }

    // Check if user account is locked
    if (user.isLocked && user.isLocked()) {
      return done(null, false, { message: 'Account is temporarily locked' });
    }

    // Check if user is verified (for email-registered users)
    if (!user.isVerified && user.password) {
      return done(null, false, { message: 'Account not verified' });
    }

    return done(null, user);
  } catch (error) {
    console.error('JWT Strategy Error:', error);
    return done(error, false);
  }
}));

// Local Strategy for email/password authentication (if needed)
const LocalStrategy = require('passport-local').Strategy;

passport.use('local', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    // Find user with password
    const user = await models.User.scope('withPassword').findOne({
      where: { email: email.toLowerCase() },
      include: [{
        model: models.Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }]
    });

    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return done(null, false, { message: 'Account is temporarily locked' });
    }

    // Check if account is active
    if (!user.isActive) {
      return done(null, false, { message: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incrementLoginAttempts();
      return done(null, false, { message: 'Invalid email or password' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return done(null, false, { 
        message: 'Account not verified', 
        requiresVerification: true,
        email: user.email 
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    return done(null, user);
  } catch (error) {
    console.error('Local Strategy Error:', error);
    return done(error, false);
  }
}));

// Serialize user for session (used by OAuth)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session (used by OAuth)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await models.User.findByPk(id, {
      include: [{
        model: models.Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }],
      attributes: { exclude: ['password', 'otp', 'refreshToken'] }
    });
    done(null, user);
  } catch (error) {
    console.error('Deserialize user error:', error);
    done(error, null);
  }
});

/**
 * Authentication middleware for protecting routes
 */
const authenticateJWT = passport.authenticate('jwt', { session: false });

/**
 * Authentication middleware for local login
 */
const authenticateLocal = passport.authenticate('local', { session: false });

/**
 * Optional authentication middleware - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    // Set user if authenticated, otherwise continue without user
    req.user = user || null;
    next();
  })(req, res, next);
};

/**
 * Middleware to check if user has required role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'No role assigned'
      });
    }

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: roles,
        current: req.user.role.name
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has required permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.role || !req.user.role.permissions) {
      return res.status(403).json({
        success: false,
        message: 'No permissions assigned'
      });
    }

    if (!req.user.role.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has any of the specified permissions
 */
const requireAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.role || !req.user.role.permissions) {
      return res.status(403).json({
        success: false,
        message: 'No permissions assigned'
      });
    }

    const hasPermission = permissions.some(permission => 
      req.user.role.permissions[permission]
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `One of these permissions required: ${permissions.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Error handler for authentication errors
 */
const handleAuthError = (err, req, res, next) => {
  if (err.name === 'AuthenticationError') {
    return res.status(401).json({
      success: false,
      message: err.message || 'Authentication failed'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  next(err);
};

module.exports = {
  passport,
  authenticateJWT,
  authenticateLocal,
  optionalAuth,
  requireRole,
  requirePermission,
  requireAnyPermission,
  handleAuthError
};