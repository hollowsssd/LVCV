'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Interview extends Model {
        static associate(models) {
            // Interview thuộc về 1 Application
            Interview.belongsTo(models.Application, {
                foreignKey: 'applicationId',
                as: 'Application'
            });

            // Interview thuộc về 1 Employer (người tạo lịch phỏng vấn)
            Interview.belongsTo(models.Employer, {
                foreignKey: 'employerId',
                as: 'Employer'
            });

            // Interview thuộc về 1 Candidate (người được phỏng vấn)
            Interview.belongsTo(models.Candidate, {
                foreignKey: 'candidateId',
                as: 'Candidate'
            });
        }
    }

    Interview.init({
        applicationId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        employerId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        candidateId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        scheduledAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        jitsiRoomId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        jitsiRoomUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
            defaultValue: 'scheduled'
        }
    }, {
        sequelize,
        modelName: 'Interview',
    });

    return Interview;
};
