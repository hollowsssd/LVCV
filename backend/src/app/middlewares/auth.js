
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader) return res.status(401).json({ message: 'Không có token' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Sai định dạng ' });
    }
    const token = parts[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; 
    next();
  } catch (err) {
    console.error('auth middleware err:', err.message);
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
  }
};