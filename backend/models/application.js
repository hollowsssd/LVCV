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
      // Application thuộc về 1 Job
      Application.belongsTo(models.Job, { foreignKey: 'jobId', as: 'Job' });

      // Application thuộc về 1 Candidate
      Application.belongsTo(models.Candidate, { foreignKey: 'candidateId', as: 'Candidate' });

      // Application thuộc về 1 Cv
      Application.belongsTo(models.Cv, { foreignKey: 'cvId', as: 'Cv' });
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