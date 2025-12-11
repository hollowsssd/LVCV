const jwt = require("jsonwebtoken");
const { user } = require("../../../models");
function authorization(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });

    const userRole = String(req.user.role || "").toUpperCase();
    const allowed = (Array.isArray(roles) ? roles : [roles]).map((r) =>
      String(r || "").toUpperCase()
    );

    if (!allowed.includes(userRole)) {
      return res.status(403).json({ message: "Không có quyền!" });
    }

    next();
  };
}
async function guestOnly(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return next();
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id);

    if (user) {
      return res.status(400).json({ message: "Bạn đã đăng nhập rồi" });
    }

    return next();
  } catch (err) {
    return next();
  }
}

module.exports = {
  authorization,
  guestOnly,
};