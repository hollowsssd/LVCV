const { Employer } = require("../../../models");

class employerController {
  // GET /api/employers
  async index(req, res) {
    try {
      const employers = await Employer.findAll();
      return res.json(employers);
    } catch (error) {
      return res.status(500).json({ error: "Lỗi lấy danh sách employer" });
    }
  }

  // GET /api/employers/:id
  async show(req, res) {
    try {
      const employer = await Employer.findByPk(req.params.id);
      if (!employer) return res.status(404).json({ message: "Không tìm thấy employer" });
      return res.json(employer);
    } catch (error) {
      return res.status(500).json({ error: "Lỗi lấy employer" });
    }
  }

  // POST /api/employers 
  async create(req, res) {
    try {
      if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });
      if (req.user.role !== "EMPLOYER" && req.user.role !== "employer") {
        return res.status(403).json({ message: "Chỉ EMPLOYER mới được tạo hồ sơ employer" });
      }

      // bắt buộc companyName
      const companyName = String(req.body.companyName ?? "").trim();
      if (!companyName) {
        return res.status(400).json({ message: "companyName là bắt buộc" });
      }

      //  mỗi user chỉ có 1 employer profile
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

  // PUT /api/employers/:id
  async update(req, res) {
    try {
      const employer = await Employer.findByPk(req.params.id);
      if (!employer) return res.status(404).json({ message: "Không tìm thấy employer" });

      //  chặn sửa userId để khỏi phá liên kết auth
      const { userId, ...safeBody } = req.body;

      await employer.update(safeBody);
      return res.json(employer);
    } catch (error) {
      return res.status(400).json({ error: "Lỗi cập nhật employer", detail: error.message });
    }
  }

  // DELETE /api/employers/:id
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