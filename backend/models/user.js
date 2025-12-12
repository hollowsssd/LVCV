'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasOne(models.Candidate, { foreignKey: 'userId', as: 'Candidate' })
      User.hasOne(models.Employer, { foreignKey: 'userId', as: 'Employer' })
    }
  }
  User.init({
    email: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for OAuth users
    },
    role: DataTypes.STRING,
    provider: {
      type: DataTypes.STRING,
      defaultValue: 'local'
    },
    providerId: DataTypes.STRING,
    avatarUrl: DataTypes.STRING,
    name: DataTypes.STRING,
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    emailVerificationOtp: DataTypes.STRING,
    emailVerificationExpires: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};