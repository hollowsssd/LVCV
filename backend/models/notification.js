'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Notification extends Model {
        static associate(models) {


            // Notification belongs to a User
            Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
        }
    }

    Notification.init({
        userId: DataTypes.INTEGER,
        type: DataTypes.STRING,    // Types: 'new_application', 'application_accepted', 'application_rejected', 'application_reviewed'
        title: DataTypes.STRING,
        message: DataTypes.TEXT,
        data: DataTypes.JSON,// Store related IDs: { applicationId, jobId, candidateId, etc. }
        isRead: DataTypes.BOOLEAN,
        readAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'Notification',
    });

    return Notification;
};
