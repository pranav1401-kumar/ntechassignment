'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('data_tables', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subcategory: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'pending', 'completed'),
        defaultValue: 'active',
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'medium',
      },
      tags: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      progress: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      is_visible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      access_level: {
        type: Sequelize.ENUM('PUBLIC', 'MANAGER', 'ADMIN'),
        defaultValue: 'PUBLIC',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('data_tables', ['category']);
    await queryInterface.addIndex('data_tables', ['status']);
    await queryInterface.addIndex('data_tables', ['priority']);
    await queryInterface.addIndex('data_tables', ['is_visible']);
    await queryInterface.addIndex('data_tables', ['access_level']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('data_tables');
  }
};