'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Candidate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Candidate.belongsTo(models.user, { foreignKey: 'userId', as: 'User' })
      Candidate.hasMany(models.Candidate, { foreignKey: 'candidateId', as: 'Cvs' })
      Candidate.hasMany(models.Candidate, { foreignKey: 'candidateId', as: 'Applications' })
    }
  }
  Candidate.init({
    fullName: DataTypes.STRING,
    phone: DataTypes.STRING,
    dob: DataTypes.DATEONLY,
    sex: DataTypes.BOOLEAN,
    address: DataTypes.STRING,
    summary: DataTypes.STRING,
    avatarUrl: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Candidate',
  });
  return Candidate;
};