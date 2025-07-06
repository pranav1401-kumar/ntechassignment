const { models } = require('../config/database');
const { Op } = require('sequelize');

class UserController {
  // Get all users (Admin only)
  async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        search = '',
        role = '',
        status = ''
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      // Role filter
      if (role) {
        const roleObj = await models.Role.findOne({ where: { name: role } });
        if (roleObj) {
          whereClause.roleId = roleObj.id;
        }
      }

      // Status filter
      if (status === 'active') {
        whereClause.isActive = true;
      } else if (status === 'inactive') {
        whereClause.isActive = false;
      }

      const { count, rows: users } = await models.User.findAndCountAll({
        where: whereClause,
        include: [{
          model: models.Role,
          as: 'role',
          attributes: ['name', 'displayName']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]],
        attributes: { exclude: ['password', 'otp', 'refreshToken'] }
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await models.User.findByPk(id, {
        include: [{
          model: models.Role,
          as: 'role',
          attributes: ['name', 'displayName', 'permissions']
        }, {
          model: models.LoginLog,
          as: 'loginLogs',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }],
        attributes: { exclude: ['password', 'otp', 'refreshToken'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  }

  // Update user profile (self)
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, phoneNumber, dateOfBirth } = req.body;

      const user = await models.User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth
      });

      const updatedUser = await models.User.findByPk(userId, {
        include: [{
          model: models.Role,
          as: 'role',
          attributes: ['name', 'displayName', 'permissions']
        }],
        attributes: { exclude: ['password', 'otp', 'refreshToken'] }
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  // Update user (Admin only)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, role, isActive } = req.body;

      const user = await models.User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const updateData = { firstName, lastName, email, isActive };

      // Handle role update
      if (role) {
        const roleObj = await models.Role.findOne({ where: { name: role } });
        if (!roleObj) {
          return res.status(400).json({
            success: false,
            message: 'Invalid role specified'
          });
        }
        updateData.roleId = roleObj.id;
      }

      await user.update(updateData);

      const updatedUser = await models.User.findByPk(id, {
        include: [{
          model: models.Role,
          as: 'role',
          attributes: ['name', 'displayName', 'permissions']
        }],
        attributes: { exclude: ['password', 'otp', 'refreshToken'] }
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  // Delete user (Admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      const user = await models.User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.destroy();

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const totalUsers = await models.User.count();
      const activeUsers = await models.User.count({ where: { isActive: true } });
      const verifiedUsers = await models.User.count({ where: { isVerified: true } });
      
      const roleStats = await models.User.findAll({
        attributes: [
          [models.sequelize.col('role.name'), 'role'],
          [models.sequelize.fn('COUNT', models.sequelize.col('User.id')), 'count']
        ],
        include: [{
          model: models.Role,
          as: 'role',
          attributes: []
        }],
        group: ['role.name'],
        raw: true
      });

      const recentRegistrations = await models.User.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          verifiedUsers,
          inactiveUsers: totalUsers - activeUsers,
          unverifiedUsers: totalUsers - verifiedUsers,
          recentRegistrations,
          roleDistribution: roleStats
        }
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics'
      });
    }
  }
}

module.exports = new UserController();