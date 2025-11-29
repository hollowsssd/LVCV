// 'use strict';
// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.createTable('Notifications', {
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: Sequelize.INTEGER
//       },
//       recipientUserId: {
//         type: Sequelize.INTEGER
//       },
//       actorUserId: {
//         type: Sequelize.INTEGER
//       },
//       type: {
//         type: Sequelize.STRING
//       },
//       title: {
//         type: Sequelize.STRING
//       },
//       message: {
//         type: Sequelize.TEXT
//       },
//       link: {
//         type: Sequelize.STRING
//       },
//       meta: {
//         type: Sequelize.JSON
//       },
//       isRead: {
//         type: Sequelize.BOOLEAN
//       },
//       createdAt: {
//         allowNull: false,
//         type: Sequelize.DATE
//       },
//       updatedAt: {
//         allowNull: false,
//         type: Sequelize.DATE
//       }
//     });
//   },
//   async down(queryInterface, Sequelize) {
//     await queryInterface.dropTable('Notifications');
//   }
// };