// models/Role.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.ENUM('ADMIN', 'MANAGER', 'VIEWER'),
      allowNull: false,
      unique: true,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'display_name',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'roles',
    underscored: true,
  });

  // Instance methods
  Role.prototype.hasPermission = function(permission) {
    return this.permissions && this.permissions[permission] === true;
  };

  Role.prototype.hasAnyPermission = function(permissions) {
    if (!this.permissions) return false;
    return permissions.some(permission => this.permissions[permission] === true);
  };

  Role.prototype.hasAllPermissions = function(permissions) {
    if (!this.permissions) return false;
    return permissions.every(permission => this.permissions[permission] === true);
  };

  // Class methods
  Role.getDefaultPermissions = function(roleName) {
    const defaultPermissions = {
      ADMIN: {
        'user.create': true,
        'user.read': true,
        'user.update': true,
        'user.delete': true,
        'user.manage': true,
        'dashboard.read': true,
        'dashboard.write': true,
        'dashboard.admin': true,
        'data.read': true,
        'data.write': true,
        'data.delete': true,
        'analytics.read': true,
        'analytics.export': true,
        'system.manage': true,
      },
      MANAGER: {
        'user.read': true,
        'dashboard.read': true,
        'dashboard.write': true,
        'data.read': true,
        'data.write': true,
        'analytics.read': true,
        'analytics.export': true,
      },
      VIEWER: {
        'dashboard.read': true,
        'data.read': true,
        'analytics.read': true,
      },
    };

    return defaultPermissions[roleName] || {};
  };

  Role.findByName = function(name) {
    return this.findOne({ where: { name } });
  };

  // Associations
  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: 'roleId',
      as: 'users',
    });
  };

  return Role;
};