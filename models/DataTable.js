// models/DataTable.js
const { DataTypes } = require('sequelize');

const DataTable = (sequelize) => {
  const DataTable = sequelize.define('DataTable', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subcategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending', 'completed'),
      defaultValue: 'active',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium',
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'end_date',
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_visible',
    },
    accessLevel: {
      type: DataTypes.ENUM('PUBLIC', 'MANAGER', 'ADMIN'),
      defaultValue: 'PUBLIC',
      field: 'access_level',
    },
  }, {
    tableName: 'data_tables',
    underscored: true,
  });

  // Instance methods
  DataTable.prototype.isAccessibleBy = function(userRole) {
    const roleHierarchy = {
      'VIEWER': ['PUBLIC'],
      'MANAGER': ['PUBLIC', 'MANAGER'],
      'ADMIN': ['PUBLIC', 'MANAGER', 'ADMIN'],
    };

    return roleHierarchy[userRole]?.includes(this.accessLevel) || false;
  };

  // Class methods
  DataTable.search = function(query, options = {}) {
    const {
      category,
      status,
      priority,
      accessLevel,
      limit = 10,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options;

    const whereClause = {
      isVisible: true,
    };

    if (query) {
      whereClause[sequelize.Sequelize.Op.or] = [
        { name: { [sequelize.Sequelize.Op.like]: `%${query}%` } },
        { description: { [sequelize.Sequelize.Op.like]: `%${query}%` } },
        { category: { [sequelize.Sequelize.Op.like]: `%${query}%` } },
      ];
    }

    if (category) whereClause.category = category;
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (accessLevel) {
      const accessLevels = {
        'VIEWER': ['PUBLIC'],
        'MANAGER': ['PUBLIC', 'MANAGER'],
        'ADMIN': ['PUBLIC', 'MANAGER', 'ADMIN'],
      };
      whereClause.accessLevel = {
        [sequelize.Sequelize.Op.in]: accessLevels[accessLevel] || ['PUBLIC']
      };
    }

    return this.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });
  };

  DataTable.getCategories = function() {
    return this.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      where: { isVisible: true },
      raw: true,
    });
  };

  DataTable.getStatistics = function() {
    return this.findAll({
      attributes: [
        'status',
        'priority',
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('value')), 'avgValue'],
        [sequelize.fn('SUM', sequelize.col('value')), 'totalValue'],
      ],
      where: { isVisible: true },
      group: ['status', 'priority', 'category'],
      raw: true,
    });
  };

  return DataTable;
};

module.exports = DataTable;