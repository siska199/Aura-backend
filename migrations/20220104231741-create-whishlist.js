'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('whishlists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      love: {
        type: Sequelize.BOOLEAN
      },
      idProduct: {
        type: Sequelize.UUID,
        references:{
          model:'products',
          key:'id'
        },
        onUpdate:"CASCADE",
        onDelete:"CASCADE"
      },
      idUser: {
        type: Sequelize.INTEGER,
        references:{
          model:'users',
          key:'id'
        },
        onUpdate:"CASCADE",
        onDelete:"CASCADE"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')

      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('whishlists');
  }
};