const { Candidate } = require("../../../models");

module.exports = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });

    // FIX: role check không phân biệt hoa/thường
    const role = String(req.user.role || "").toLowerCase();
    if (role !== "candidate") {
      return res.status(403).json({ message: "Chỉ CANDIDATE mới được dùng API này" });
    }

    // users.id -> candidates.userId -> candidates.id
    const candidate = await Candidate.findOne({
      where: { userId: req.user.id },
      attributes: ["id"],
    });

    if (!candidate) {
      return res.status(403).json({ message: "Chưa có hồ sơ candidate" });
    }

    req.candidate = candidate; // req.candidate.id dùng cho cvController
    return next();
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", detail: err.message });
  }
};