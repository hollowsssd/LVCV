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
<<<<<<< HEAD
        // Mỗi CV thuộc về 1 Candidate
        Cv.belongsTo(models.Candidate, { foreignKey: 'candidateId', as: 'Candidate' });

        // Một CV có thể được dùng cho nhiều Application
        Cv.hasMany(models.Application, { foreignKey: 'cvId', as: 'Applications' });
=======
      Cv.belongsToMany(models.Cv, { foreignKey: 'candidateId', as: 'Candidates' })
      Cv.hasMany(models.Cv, { foreignKey: 'cvId', as: 'Applications' })
>>>>>>> 3690667a0b9b113f38a2a081774f941556a9d74b
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