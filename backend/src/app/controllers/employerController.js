const { Employer } = require("../../../models");
const { safeUnlink } = require("../config/upload");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "../../../../");

class employerController {
  // Lấy danh sách tất cả nhà tuyển dụng
  async index(req, res) {
    try {
      const employers = await Employer.findAll();
      return res.json(employers);
    } catch (error) {
      return res.status(500).json({ error: "Lỗi lấy danh sách employer" });
    }
  }
  // thong tin nha tuyen dung


  // Lấy hồ sơ nhà tuyển dụng của user đang đăng nhập
  async me(req, res) {
    try {
      if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });

      const employer = await Employer.findOne({
        where: { userId: req.user.id },
      });

      if (!employer) return res.status(404).json({ message: "Chưa có hồ sơ employer" });
      return res.json(employer);
    } catch (error) {
      return res.status(500).json({ error: "Lỗi lấy employer (me)" });
    }
  }

  // Lấy thông tin 1 nhà tuyển dụng theo ID
  async show(req, res) {
    try {
      const employer = await Employer.findByPk(req.params.id);
      if (!employer) return res.status(404).json({ message: "Không tìm thấy employer" });
      return res.json(employer);
    } catch (error) {
      return res.status(500).json({ error: "Lỗi lấy employer" });
    }
  }

  // Tạo mới hồ sơ nhà tuyển dụng
  async create(req, res) {
    try {
      // bắt buộc companyName
      const companyName = String(req.body.companyName ?? "").trim();
      if (!companyName) {
        return res.status(400).json({ message: "companyName là bắt buộc" });
      }

      // mỗi user chỉ có 1 employer profile
      const existed = await Employer.findOne({ where: { userId: req.user.id } });
      if (existed) {
        return res.status(409).json({ message: "Employer profile đã tồn tại" });
      }

      // không cho FE set userId linh tinh
      const { userId, ...safeBody } = req.body;

      const employer = await Employer.create({
        ...safeBody,
        companyName,
        userId: req.user.id, // QUAN TRỌNG
      });

      return res.status(201).json(employer);
    } catch (error) {
      return res.status(400).json({ error: "Lỗi tạo employer", detail: error.message });
    }
  }

  // Cập nhật thông tin nhà tuyển dụng
  async update(req, res) {
    try {
      const employer = await Employer.findByPk(req.params.id);
      if (!employer) return res.status(404).json({ message: "Không tìm thấy employer" });

      // chặn sửa userId để khỏi phá liên kết auth
      const { userId, ...safeBody } = req.body;

      await employer.update(safeBody);
      return res.json(employer);
    } catch (error) {
      return res.status(400).json({ error: "Lỗi cập nhật employer", detail: error.message });
    }
  }

  // Upload logo cho nhà tuyển dụng
  async uploadLogo(req, res) {
    try {
      const employer = await Employer.findByPk(req.params.id);
      if (!employer) {
        safeUnlink(req.file?.path);
        return res.status(404).json({ message: "Không tìm thấy employer" });
      }

      // Kiểm tra quyền sở hữu: chỉ chủ sở hữu mới được upload logo
      if (employer.userId !== req.user.id) {
        safeUnlink(req.file?.path);
        return res.status(403).json({ message: "Không có quyền thay đổi logo của công ty khác" });
      }

      // Xóa logo cũ nếu có
      if (employer.logoUrl) {
        const oldPath = path.join(PROJECT_ROOT, employer.logoUrl);
        safeUnlink(oldPath);
      }

      // Cập nhật đường dẫn logo mới
      const logoUrl = `/uploads/logos/${req.file.filename}`;
      await employer.update({ logoUrl });

      return res.json(employer);
    } catch (error) {
      safeUnlink(req.file?.path);
      return res.status(500).json({ error: "Lỗi upload logo", detail: error.message });
    }
  }

  // Xóa hồ sơ nhà tuyển dụng
  async delete(req, res) {
    try {
      const employer = await Employer.findByPk(req.params.id);
      if (!employer) return res.status(404).json({ message: "Không tìm thấy employer" });

      await employer.destroy();
      return res.json({ message: "Xóa thành công" });
    } catch (error) {
      return res.status(500).json({ error: "Lỗi xóa employer" });
    }
  }
}

module.exports = new employerController();