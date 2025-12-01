"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Jobs", "companyName", {
      type: Sequelize.STRING,
      allowNull: true, // hoặc false nếu bạn bắt buộc
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Jobs", "companyName");
  },
};