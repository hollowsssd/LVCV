'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Application.belongsToMany(models.Application, { foreignKey: 'jobId', as: 'Jobs' })
      Application.belongsToMany(models.Application, { foreignKey: 'candidateId', as: 'Candidates' })
      Application.belongsToMany(models.Application, { foreignKey: 'cvId', as: 'Cvs' })
    }
  }
  Application.init({
    jobId: DataTypes.INTEGER,
    candidateId: DataTypes.INTEGER,
    cvId: DataTypes.INTEGER,
    coverLetter: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Application',
  });
  return Application;
};