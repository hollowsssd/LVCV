'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Employer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Employer.belongsTo(models.User, { foreignKey: 'userId', as: 'User' })
      Employer.hasMany(models.Job, { foreignKey: 'employerId', as: 'jobs' })
    }
  }
  Employer.init({
    companyName: DataTypes.STRING,
    logoUrl: DataTypes.STRING,
    website: DataTypes.STRING,
    industry: DataTypes.STRING,
    description: DataTypes.STRING,
    location: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Employer',
  });
  return Employer;
};