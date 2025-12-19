const { Candidate } = require("../../../models");
const { safeUnlink } = require("../config/upload");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "../../../../");

class candidateController {
  // Lấy danh sách tất cả ứng viên
  async index(req, res) {
    try {
      const candidates = await Candidate.findAll();
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ error: "Lỗi lấy danh sách candidate" });
    }
  }
  async me(req, res) {
    try {
      if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });

      const candidate = await Candidate.findOne({
        where: { userId: req.user.id },
      });

      if (!candidate) return res.status(404).json({ message: "Chưa có hồ sơ candidate" });
      return res.json(candidate);
    } catch (error) {
      return res.status(500).json({ error: "Lỗi lấy candidate (me)" });
    }
  }

  // Lấy thông tin 1 ứng viên theo ID
  async show(req, res) {
    try {
      const candidate = await Candidate.findByPk(req.params.id);
      if (!candidate)
        return res.status(404).json({ message: "Không tìm thấy candidate" });
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ error: "Lỗi lấy candidate" });
    }
  }

  // Tạo mới hồ sơ ứng viên
  async create(req, res) {
    try {
      const candidate = await Candidate.create(req.body);
      res.status(201).json(candidate);
    } catch (error) {
      res.status(400).json({ error: "Lỗi tạo candidate" });
    }
  }

  // Cập nhật thông tin ứng viên
  async update(req, res) {
    try {
      const candidate = await Candidate.findByPk(req.params.id);
      if (!candidate)
        return res.status(404).json({ message: "Không tìm thấy candidate" });

      await candidate.update(req.body);
      res.json(candidate);
    } catch (error) {
      res.status(400).json({ error: "Lỗi cập nhật candidate" });
    }
  }

  // Upload avatar cho ứng viên
  async uploadAvatar(req, res) {
    try {
      const candidate = await Candidate.findByPk(req.params.id);
      if (!candidate) {
        safeUnlink(req.file?.path);
        return res.status(404).json({ message: "Không tìm thấy candidate" });
      }

      // Kiểm tra quyền sở hữu: chỉ chủ sở hữu mới được upload avatar
      if (candidate.userId !== req.user.id) {
        safeUnlink(req.file?.path);
        return res.status(403).json({ message: "Không có quyền thay đổi avatar của người khác" });
      }

      // Xóa avatar cũ nếu có
      if (candidate.avatarUrl) {
        const oldPath = path.join(PROJECT_ROOT, candidate.avatarUrl);
        safeUnlink(oldPath);
      }

      // Cập nhật đường dẫn avatar mới
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      await candidate.update({ avatarUrl });

      return res.json(candidate);
    } catch (error) {
      safeUnlink(req.file?.path);
      return res.status(500).json({ error: "Lỗi upload avatar", detail: error.message });
    }
  }

  // Xóa hồ sơ ứng viên
  async delete(req, res) {
    try {
      const candidate = await Candidate.findByPk(req.params.id);
      if (!candidate)
        return res.status(404).json({ message: "Không tìm thấy candidate" });

      await candidate.destroy();
      res.json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ error: "Lỗi xóa candidate" });
    }
  }
}

module.exports = new candidateController();

