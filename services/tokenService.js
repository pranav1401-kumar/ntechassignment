const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { models } = require('../config/database');

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    return { accessToken, refreshToken };
  }

  async saveRefreshToken(userId, refreshToken) {
    try {
      await models.User.update(
        { refreshToken },
        { where: { id: userId } }
      );
    } catch (error) {
      console.error('Save refresh token error:', error);
      throw new Error('Failed to save refresh token');
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await models.User.findByPk(decoded.userId, {
        include: [{
          model: models.Role,
          as: 'role',
          attributes: ['name', 'permissions']
        }]
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      const payload = {
        userId: user.id,
        email: user.email,
        role: user.role.name
      };

      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(payload);
      
      await this.saveRefreshToken(user.id, newRefreshToken);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      throw new Error('Invalid or expired refresh token');
    }
  }

  async revokeRefreshToken(userId) {
    try {
      await models.User.update(
        { refreshToken: null },
        { where: { id: userId } }
      );
    } catch (error) {
      console.error('Revoke refresh token error:', error);
      throw new Error('Failed to revoke refresh token');
    }
  }

  generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async createPasswordResetToken(email) {
    try {
      const user = await models.User.findOne({ where: { email } });
      
      if (!user) {
        throw new Error('User not found');
      }

      const token = this.generatePasswordResetToken();
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await user.update({
        passwordResetToken: token,
        passwordResetExpiry: expiry
      });

      return token;
    } catch (error) {
      console.error('Password reset token error:', error);
      throw error;
    }
  }

  async verifyPasswordResetToken(token) {
    try {
      const user = await models.User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpiry: {
            [models.sequelize.Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      return user;
    } catch (error) {
      console.error('Verify reset token error:', error);
      throw error;
    }
  }

  async clearPasswordResetToken(userId) {
    try {
      await models.User.update(
        {
          passwordResetToken: null,
          passwordResetExpiry: null
        },
        { where: { id: userId } }
      );
    } catch (error) {
      console.error('Clear reset token error:', error);
      throw new Error('Failed to clear reset token');
    }
  }
}

module.exports = new TokenService();