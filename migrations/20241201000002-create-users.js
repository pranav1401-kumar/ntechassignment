'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      otp_expiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      login_attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lock_until: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      refresh_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      password_reset_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      password_reset_expiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      google_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      github_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      microsoft_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      apple_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      date_of_birth: {
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
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role_id']);
    await queryInterface.addIndex('users', ['is_active']);
    await queryInterface.addIndex('users', ['is_verified']);
    await queryInterface.addIndex('users', ['google_id']);
    await queryInterface.addIndex('users', ['github_id']);
    await queryInterface.addIndex('users', ['microsoft_id']);
    await queryInterface.addIndex('users', ['apple_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};