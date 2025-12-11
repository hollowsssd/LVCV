const express = require('express');
const router = express.Router();
const notificationController = require('../app/controllers/notificationController');
const auth = require('../app/middlewares/auth');
const { authorization } = require("../app/middlewares/authorization");

router.use(auth, authorization('EMPLOYER' || 'CANDIDATE'));

router.get('/', notificationController.index);

// Lấy số chưa đọc
router.get('/unread-count', notificationController.unreadCount);

// Đánh dấu tất cả đã đọc
router.put('/read-all', notificationController.markAllAsRead);

// Đánh dấu 1 cái đã đọc
router.put('/:id/read', notificationController.markAsRead);

router.delete('/:id', notificationController.delete);

module.exports = router;
