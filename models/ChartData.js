// models/ChartData.js
const { DataTypes } = require('sequelize');

const ChartData = (sequelize) => {
  const ChartData = sequelize.define('ChartData', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('line', 'bar', 'pie', 'area', 'column', 'spline'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    config: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'general',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    accessLevel: {
      type: DataTypes.ENUM('PUBLIC', 'MANAGER', 'ADMIN'),
      defaultValue: 'PUBLIC',
    },
  });

  // Class methods
  ChartData.getByCategory = function(category, userRole = 'VIEWER') {
    const accessLevels = {
      'VIEWER': ['PUBLIC'],
      'MANAGER': ['PUBLIC', 'MANAGER'],
      'ADMIN': ['PUBLIC', 'MANAGER', 'ADMIN'],
    };

    return this.findAll({
      where: {
        category,
        accessLevel: {
          [sequelize.Sequelize.Op.in]: accessLevels[userRole] || ['PUBLIC']
        },
        isActive: true,
      },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });
  };

  ChartData.getByAccessLevel = function(userRole) {
    const accessLevels = {
      'VIEWER': ['PUBLIC'],
      'MANAGER': ['PUBLIC', 'MANAGER'],
      'ADMIN': ['PUBLIC', 'MANAGER', 'ADMIN'],
    };

    return this.findAll({
      where: {
        accessLevel: {
          [sequelize.Sequelize.Op.in]: accessLevels[userRole] || ['PUBLIC']
        },
        isActive: true,
      },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });
  };

  return ChartData;
};

module.exports = ChartData;