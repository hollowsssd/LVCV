'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cv extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Cv.belongsToMany(models.Cv, { foreignKey: 'candidateId', as: 'Candidates' })
      Cv.hasMany(models.Cv, { foreignKey: 'cvId', as: 'Applications' })
    }
  }
  Cv.init({
    title: DataTypes.STRING,
    fileUrl: DataTypes.STRING,
    fileType: DataTypes.STRING,
    isDefault: DataTypes.BOOLEAN,
    candidateId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Cv',
  });
  return Cv;
};