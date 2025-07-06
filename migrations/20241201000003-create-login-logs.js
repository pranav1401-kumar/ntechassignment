'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('login_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      login_method: {
        type: Sequelize.ENUM('email', 'google', 'github', 'microsoft', 'apple'),
        allowNull: false,
        defaultValue: 'email',
      },
      success: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      failure_reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      location: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      session_duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      logout_time: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.addIndex('login_logs', ['user_id']);
    await queryInterface.addIndex('login_logs', ['created_at']);
    await queryInterface.addIndex('login_logs', ['success']);
    await queryInterface.addIndex('login_logs', ['login_method']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('login_logs');
  }
};