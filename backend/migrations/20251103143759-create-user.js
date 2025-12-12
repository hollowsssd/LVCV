'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true // Allow null for OAuth users
      },
      role: {
        type: Sequelize.ENUM('CANDIDATE', 'EMPLOYER', 'ADMIN'),
        allowNull: true, // Allow null for OAuth users who haven't selected role
        defaultValue: null
      },
      // OAuth fields
      provider: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'local'
      },
      providerId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      avatarUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // Email verification fields
      emailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      emailVerificationOtp: {
        type: Sequelize.STRING(6),
        allowNull: true
      },
      emailVerificationExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};