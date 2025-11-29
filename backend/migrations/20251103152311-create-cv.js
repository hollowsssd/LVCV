'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cvs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      fileUrl: {
        type: Sequelize.STRING
      },
      fileType: {
        type: Sequelize.STRING
      },
      isDefault: {
        type: Sequelize.BOOLEAN
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      candidateId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Candidates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('Cvs');
  }
};