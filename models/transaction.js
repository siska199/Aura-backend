'use strict';
const {
  Model, Transaction
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      transaction.belongsTo(models.user,{
        as:'user',
        foreignKey:'idUser'
      })

      transaction.belongsTo(models.product,{
        as:  'product',
        foreignKey : 'idProduct'
      })
    }
  };
  transaction.init({
    qty: DataTypes.INTEGER,
    total: DataTypes.INTEGER,
    status: DataTypes.STRING,
    idUser: DataTypes.INTEGER,
    idProduct: DataTypes.UUID,
  }, {
    sequelize,
    modelName: 'transaction',
  });
  return transaction;
};