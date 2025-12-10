const { Notification } = require('../../../models');

class NotificationService {

    async createAndSend(io, { userId, type, title, message, data }) {
        // 1. Lưu vào database
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            data,
            isRead: false
        });

        // 2. Gửi real-time qua socket đến đúng user
        io.to(`user_${userId}`).emit('notification', {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            isRead: notification.isRead,
            createdAt: notification.createdAt
        });

        return notification;
    }

    async getByUserId(userId, options = {}) {
        const { page = 1, limit = 20, unreadOnly = false } = options;

        const where = { userId };
        if (unreadOnly) {
            where.isRead = false;
        }

        const notifications = await Notification.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        return {
            notifications: notifications.rows,
            total: notifications.count,
            page: parseInt(page),
            totalPages: Math.ceil(notifications.count / parseInt(limit))
        };
    }


    // Đếm số notification chưa đọc
    async getUnreadCount(userId) {
        return await Notification.count({
            where: { userId, isRead: false }
        });
    }

    // Đánh dấu notification đã đọc
    async markAsRead(notificationId, userId) {
        const notification = await Notification.findOne({
            where: { id: notificationId, userId }
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        await notification.update({
            isRead: true,
            readAt: new Date()
        });

        return notification;
    }

    // Đánh dấu tất cả đã đọc
    async markAllAsRead(userId) {
        await Notification.update(
            { isRead: true, readAt: new Date() },
            { where: { userId, isRead: false } }
        );
    }

    // Xóa notification
    async delete(notificationId, userId) {
        const result = await Notification.destroy({
            where: { id: notificationId, userId }
        });
        return result > 0;
    }

    // Xóa notifications cũ (cleanup job)
    async deleteOld(daysOld = 30) {
        const { Op } = require('sequelize');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        await Notification.destroy({
            where: {
                createdAt: { [Op.lt]: cutoffDate },
                isRead: true
            }
        });
    }
}

module.exports = new NotificationService();
