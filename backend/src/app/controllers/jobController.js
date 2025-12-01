const { Job } = require("../../../models");

class jobController {
  async index(req, res) {
    try {
      const jobs = await Job.findAll();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Lỗi lấy danh sách job" });
    }
  }

  async show(req, res) {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) return res.status(404).json({ message: "Không tìm thấy job" });
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Lỗi lấy job" });
    }
  }

  async create(req, res) {
    try {
      const { employerId, ...safeBody } = req.body;

      // them check companyName o employer
      if (!req.employer?.companyName) {
        return res.status(400).json({ message: "Employer chưa có companyName" });
      }

      const job = await Job.create({
        ...safeBody,
        employerId: req.employer.id,
        companyName: req.employer.companyName,
      });

      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ error: "Lỗi tạo job", detail: error.message });
    }
  }

  async update(req, res) {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) return res.status(404).json({ message: "Không tìm thấy job" });

      if (job.employerId !== req.employer.id) {
        return res.status(403).json({ message: "Không có quyền sửa job này" });
      }

      const { employerId, ...safeBody } = req.body;

      await job.update(safeBody);
      res.json(job);
    } catch (error) {
      res.status(400).json({ error: "Lỗi cập nhật job", detail: error.message });
    }
  }

  async delete(req, res) {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) return res.status(404).json({ message: "Không tìm thấy job" });

      if (job.employerId !== req.employer.id) {
        return res.status(403).json({ message: "Không có quyền xóa job này" });
      }

      await job.destroy();
      res.json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ error: "Lỗi xóa job", detail: error.message });
    }
  }
}

module.exports = new jobController();