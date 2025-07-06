// controllers/authController.js
const bcrypt = require('bcrypt');
const { models } = require('../config/database');
const tokenService = require('../services/tokenService');
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');

class AuthController {
  // User Registration
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, role = 'VIEWER' } = req.body;

      // Check if user already exists
      const existingUser = await models.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Get role
      const userRole = await models.Role.findOne({ where: { name: role } });
      if (!userRole) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }

      // Create user
      const user = await models.User.create({
        email,
        password,
        firstName,
        lastName,
        roleId: userRole.id,
        isVerified: false
      });

      // Send OTP for verification
      await otpService.sendOtp(email, 'registration');

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification code.',
        data: {
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: userRole.name,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Email/Password Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user with password
      const user = await models.User.scope('withPassword').findOne({
        where: { email },
        include: [{
          model: models.Role,
          as: 'role',
          attributes: ['name', 'permissions']
        }]
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is locked
      if (user.isLocked()) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to too many failed login attempts'
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incrementLoginAttempts();
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if user is verified
      if (!user.isVerified) {
        // Send new OTP
        await otpService.sendOtp(email, 'registration');
        return res.status(403).json({
          success: false,
          message: 'Account not verified. Please check your email for verification code.',
          requiresVerification: true
        });
      }

      // Reset login attempts on successful password verification
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Send OTP for two-factor authentication
      await otpService.sendOtp(email, 'login');

      res.json({
        success: true,
        message: 'Credentials verified. Please check your email for verification code.',
        requiresOtp: true,
        data: {
          email: user.email,
          firstName: user.firstName
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // OTP Verification
  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;

      const user = await models.User.findOne({
        where: { email },
        include: [{
          model: models.Role,
          as: 'role',
          attributes: ['name', 'permissions']
        }]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify OTP
      const otpResult = await otpService.verifyOtp(email, otp);
      if (!otpResult.success) {
        return res.status(400).json({
          success: false,
          message: otpResult.message
        });
      }

      // Update user verification status if this was registration OTP
      if (!user.isVerified) {
        await user.update({ isVerified: true });
        await emailService.sendWelcomeEmail(email, user.firstName);
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      // Generate tokens
      const payload = {
        userId: user.id,
        email: user.email,
        role: user.role.name
      };

      const { accessToken, refreshToken } = tokenService.generateTokens(payload);
      await tokenService.saveRefreshToken(user.id, refreshToken);

      // Log successful login
      await models.LoginLog.create({
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        loginMethod: 'email',
        success: true
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isVerified: true,
            lastLogin: user.lastLogin
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({
        success: false,
        message: 'OTP verification failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Resend OTP
  async resendOtp(req, res) {
    try {
      const { email } = req.body;

      const user = await models.User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const type = user.isVerified ? 'login' : 'registration';
      await otpService.resendOtp(email, type);

      res.json({
        success: true,
        message: 'OTP sent successfully'
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      
      if (error.message.includes('wait before requesting')) {
        return res.status(429).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to resend OTP',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Refresh Token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      const result = await tokenService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const userId = req.user.id;

      // Revoke refresh token
      await tokenService.revokeRefreshToken(userId);

      // Log logout in login logs
      const lastLoginLog = await models.LoginLog.findOne({
        where: { userId, logoutTime: null },
        order: [['createdAt', 'DESC']]
      });

      if (lastLoginLog) {
        await lastLoginLog.update({
          logoutTime: new Date(),
          sessionDuration: Math.floor((new Date() - lastLoginLog.createdAt) / 60000) // in minutes
        });
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get Current User
  async getCurrentUser(req, res) {
    try {
      const user = await models.User.findByPk(req.user.id, {
        include: [{
          model: models.Role,
          as: 'role',
          attributes: ['name', 'permissions']
        }],
        attributes: { exclude: ['password', 'otp', 'refreshToken'] }
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user information'
      });
    }
  }

  // Forgot Password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await models.User.findOne({ where: { email } });
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
      }

      const resetToken = await tokenService.createPasswordResetToken(email);
      await emailService.sendPasswordResetEmail(email, resetToken, user.firstName);

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request'
      });
    }
  }

  // Reset Password
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      const user = await tokenService.verifyPasswordResetToken(token);
      await user.update({ password });
      await tokenService.clearPasswordResetToken(user.id);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.message.includes('Invalid or expired')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to reset password'
      });
    }
  }

  // Change Password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await models.User.scope('withPassword').findByPk(userId);
      
      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change password for OAuth accounts'
        });
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      await user.update({ password: newPassword });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }

  // OAuth Success Handler
  async oauthSuccess(req, res) {
    try {
      const user = req.user;

      // Generate tokens
      const payload = {
        userId: user.id,
        email: user.email,
        role: user.role.name
      };

      const { accessToken, refreshToken } = tokenService.generateTokens(payload);
      await tokenService.saveRefreshToken(user.id, refreshToken);

      // Update last login
      await user.update({ lastLogin: new Date() });

      // Log successful login
      await models.LoginLog.create({
        userId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        loginMethod: req.authInfo?.provider || 'oauth',
        success: true
      });

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth success error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }

  // OAuth Failure Handler
  async oauthFailure(req, res) {
    console.error('OAuth failure:', req.query);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
}

module.exports = new AuthController();