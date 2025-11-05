'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Job có nhiều Tag (nhiều-nhiều)
      Job.belongsToMany(models.Tag, { through: 'Tag_jobs', foreignKey: 'jobId', otherKey: 'tagId' });

      // Job thuộc về 1 Employer
      Job.belongsTo(models.Employer, { foreignKey: 'employerId', as: 'Employer' });

      // Job có nhiều Application
      Job.hasMany(models.Application, { foreignKey: 'jobId', as: 'Applications' });
    }
  }
  Job.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    salaryMin: DataTypes.DOUBLE,
    salaryMax: DataTypes.DOUBLE,
    isNegotiable: DataTypes.BOOLEAN,
    location: DataTypes.STRING,
    jobType: DataTypes.STRING,
    experienceRequired: DataTypes.STRING,
    deadline: DataTypes.DATEONLY,
    status: DataTypes.STRING,
    employerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Job',
  });
  return Job;
};