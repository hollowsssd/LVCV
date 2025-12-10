const notificationService = require('../services/notificationService');

class NotificationController {


    // Lấy danh sách các thông báo của user
    async index(req, res) {
        try {
            const userId = req.user.id;
            const { page, limit, unreadOnly } = req.query;

            const result = await notificationService.getByUserId(userId, {
                page: page || 1,
                limit: limit || 20,
                unreadOnly: unreadOnly === 'true'
            });


            res.json(result);
        } catch (error) {
            console.error('Error getting notifications:', error);
            res.status(500).json({ error: 'Lỗi lấy danh sách thông báo' });
        }
    }

    // Lấy số thông báo chưa đọc
    async unreadCount(req, res) {
        try {
            const userId = req.user.id;
            const count = await notificationService.getUnreadCount(userId);
            res.json({ count });
        } catch (error) {
            console.error('Error getting unread count:', error);
            res.status(500).json({ error: 'Lỗi lấy số thông báo chưa đọc' });
        }
    }


    // Đánh dấu 1 thông báo đã đọc
    async markAsRead(req, res) {
        try {
            const userId = req.user.id;
            const notificationId = req.params.id;

            const notification = await notificationService.markAsRead(notificationId, userId);
            res.json(notification);
        } catch (error) {
            if (error.message === 'Notification not found') {
                return res.status(404).json({ error: 'Không tìm thấy thông báo' });
            }
            console.error('Error marking notification as read:', error);
            res.status(500).json({ error: 'Lỗi cập nhật thông báo' });
        }
    }

    // Đánh dấu tất cả đã đọc
    async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;
            await notificationService.markAllAsRead(userId);
            res.json({ message: 'Đã đánh dấu tất cả đã đọc' });
        } catch (error) {
            console.error('Error marking all as read:', error);
            res.status(500).json({ error: 'Lỗi cập nhật thông báo' });
        }
    }

    // Xóa 1 thông báo
    async delete(req, res) {
        try {
            const userId = req.user.id;
            const notificationId = req.params.id;

            const deleted = await notificationService.delete(notificationId, userId);
            if (!deleted) {
                return res.status(404).json({ error: 'Không tìm thấy thông báo' });
            }
            res.json({ message: 'Đã xóa thông báo' });
        } catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({ error: 'Lỗi xóa thông báo' });
        }
    }
}

module.exports = new NotificationController();
