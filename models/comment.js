'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      comment.belongsTo(models.product,{
        as:'product',
        foreignKey:'idProduct',
      })

      comment.belongsTo(models.user,{
        as:'user',
        foreignKey:'idUser',
      })
    }
  };
  comment.init({
    idUser: DataTypes.INTEGER,
    idProduct: DataTypes.UUID,
    comment: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'comment',
  });
  return comment;
};