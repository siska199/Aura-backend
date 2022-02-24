'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.hasMany(models.product,{
        as : "products",
        foreignKey:{name:'idUser'}      
      })
    }
  };
  user.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    username: DataTypes.STRING,
    status: DataTypes.STRING,
    fullName: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.INTEGER,
    gender: DataTypes.STRING,
    image: DataTypes.STRING,
    image_public_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};