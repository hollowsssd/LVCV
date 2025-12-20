'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Interviews', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            applicationId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Applications',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            employerId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Employers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            candidateId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Candidates',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            scheduledAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            jitsiRoomId: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            jitsiRoomUrl: {
                type: Sequelize.STRING,
                allowNull: false
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('scheduled', 'completed', 'cancelled'),
                defaultValue: 'scheduled'
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

        // Add index for faster lookups
        await queryInterface.addIndex('Interviews', ['applicationId']);
        await queryInterface.addIndex('Interviews', ['employerId']);
        await queryInterface.addIndex('Interviews', ['candidateId']);
        await queryInterface.addIndex('Interviews', ['jitsiRoomId']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Interviews');
    }
};
