const { Candidate } = require("../../../models");

module.exports = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const role = String(req.user.role || "").toLowerCase();
    if (role !== "candidate") {
      return res.status(403).json({ message: "Chỉ Candidate mới dùng API này" });
    }

    const candidate = await Candidate.findOne({
      where: { userId: req.user.id },
      attributes: ["id", "userId"],
    });

    if (!candidate) {
      return res.status(404).json({ message: "Chưa có hồ sơ candidate" });
    }

    req.candidate = { id: candidate.id, userId: candidate.userId };
    return next();
  } catch (err) {
    return res.status(500).json({ message: "requireCandidate lỗi", detail: err.message });
  }
};