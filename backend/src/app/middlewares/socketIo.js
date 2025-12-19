const jwt = require('jsonwebtoken');

module.exports = function (socket, next) {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        // Verify token giống như auth middleware của API
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Gắn user info vào socket để sử dụng
        // Token được tạo với { id, email, role } nên dùng decoded.id
        socket.userId = decoded.id;
        socket.user = decoded;

        next();
    } catch (err) {
        console.error('Socket auth error:', err.message);
        next(new Error('Invalid token'));
    }
};