const jwt = require('jsonwebtoken');
const { User } = require('../../../models');

/**
 * Middleware to check if user has selected a role.
 * Use after auth middleware.
 * Returns 403 with code 'NO_ROLE' if user hasn't selected a role yet.
 */
module.exports = async (req, res, next) => {
    try {
        // req.user should be set by auth middleware
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Chưa đăng nhập' });
        }

        // Check user's role from database (more accurate than JWT payload)
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        if (!user.role) {
            return res.status(403).json({
                message: 'Vui lòng hoàn tất đăng ký bằng cách chọn loại tài khoản',
                code: 'NO_ROLE',
                redirectTo: '/auth/select-role'
            });
        }

        // Attach full user to request
        req.dbUser = user;
        next();
    } catch (err) {
        console.error('requireRole middleware err:', err.message);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};
