// models/LoginLog.js
const { DataTypes } = require('sequelize');

const LoginLog = (sequelize) => {
  const LoginLog = sequelize.define('LoginLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ip_address',
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'user_agent',
    },
    loginMethod: {
      type: DataTypes.ENUM('email', 'google', 'github', 'microsoft', 'apple'),
      allowNull: false,
      defaultValue: 'email',
      field: 'login_method',
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    failureReason: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'failure_reason',
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    sessionDuration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true,
      field: 'session_duration',
    },
    logoutTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'logout_time',
    },
  }, {
    tableName: 'login_logs',
    underscored: true,
  });

  LoginLog.associate = (models) => {
    LoginLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return LoginLog;
};

module.exports = LoginLog;