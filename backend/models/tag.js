'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
<<<<<<< HEAD
      // Tag có nhiều Job (nhiều-nhiều)
      Tag.belongsToMany(models.Job, { through: models.Tag_job, foreignKey: 'tagId', otherKey: 'jobId' });
=======
      Tag.belongsToMany(models.Tag, { through: Tag_jobs, foreignKey: 'tagId', otherKey:'jobId' })
>>>>>>> 3690667a0b9b113f38a2a081774f941556a9d74b
    }
  }
  Tag.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tag',
  });
  return Tag;
};