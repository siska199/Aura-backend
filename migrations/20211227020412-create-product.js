'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
        validate: {
          notNull: true
        }
      },
      images: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      review: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.INTEGER
      },
      desc: {
        type: Sequelize.STRING
      },
      stock: {
        type: Sequelize.INTEGER
      },
      stockFull: {
        type: Sequelize.INTEGER
      },
      size: {
        type: Sequelize.STRING
      },
      color: {
        type: Sequelize.STRING
      },
      idCategory: {
        type: Sequelize.INTEGER,
        references : {
          model:'categories',
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
    await queryInterface.dropTable('products');
  }
};