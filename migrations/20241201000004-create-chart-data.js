'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chart_data', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('line', 'bar', 'pie', 'area', 'column', 'spline'),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      data: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      config: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'general',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.addIndex('chart_data', ['category']);
    await queryInterface.addIndex('chart_data', ['is_active']);
    await queryInterface.addIndex('chart_data', ['access_level']);
    await queryInterface.addIndex('chart_data', ['sort_order']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('chart_data');
  }
};