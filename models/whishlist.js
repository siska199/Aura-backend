'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class whishlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      whishlist.belongsTo(models.user,{
        as:'user',
        foreignKey:'idUser'
      })

      whishlist.belongsTo(models.product,{
        as:  'product',
        foreignKey : 'idProduct'
      })

    }
  };
  whishlist.init({
    love: DataTypes.BOOLEAN,
    idProduct: DataTypes.UUID,
    idUser: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'whishlist',
  });
  return whishlist;
};