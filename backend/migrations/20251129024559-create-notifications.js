// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable("Notifications", {
//       id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

//       recipientUserId: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//       },

//       actorUserId: {
//         type: Sequelize.INTEGER,
//         allowNull: true,
//       },

//       type: {
//         type: Sequelize.STRING(50),
//         allowNull: false,
//         defaultValue: "SYSTEM",
//       },

//       title: { type: Sequelize.STRING(255), allowNull: false },
//       message: { type: Sequelize.TEXT, allowNull: false },

//       link: { type: Sequelize.STRING(255), allowNull: true },

//       meta: { type: Sequelize.JSON, allowNull: true },

//       isRead: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

//       createdAt: { type: Sequelize.DATE, allowNull: false },
//       updatedAt: { type: Sequelize.DATE, allowNull: false },
//     });

//     await queryInterface.addIndex("Notifications", ["recipientUserId", "isRead"]);
//     await queryInterface.addIndex("Notifications", ["createdAt"]);
//   },

//   async down(queryInterface) {
//     await queryInterface.dropTable("Notifications");
//   },
// };