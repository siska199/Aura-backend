'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      product.belongsTo(user,{
        as:'user',
        foreignKey:'idUser'
      })

      product.belongsTo(category,{
        as:  'category',
        foreignKey : 'idCategory'
      })
    }
  };
  product.init({
    id : {
      allowNull: false,
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      validate: {
        notNull: true
      }
    },
    title: DataTypes.STRING,
    review: DataTypes.STRING,
    price: DataTypes.INTEGER,
    desc: DataTypes.STRING,
    stock: DataTypes.INTEGER,
    stockFull: DataTypes.INTEGER,
    size: DataTypes.STRING,
    color: DataTypes.STRING,
    idCategory: DataTypes.INTEGER,
    idUser: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'product',
  });
  return product;
};