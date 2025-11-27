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

module.exports = authorization;