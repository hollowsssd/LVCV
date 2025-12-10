'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Notifications', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false
                // Types: 'new_application', 'application_accepted', 'application_rejected', 'application_reviewed'
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            message: {
                type: Sequelize.TEXT
            },
            data: {
                type: Sequelize.JSON
            },
            isRead: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            readAt: {
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

        // Add index for faster queries
        await queryInterface.addIndex('Notifications', ['userId']);
        await queryInterface.addIndex('Notifications', ['isRead']);
        await queryInterface.addIndex('Notifications', ['createdAt']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Notifications');
    }
};
