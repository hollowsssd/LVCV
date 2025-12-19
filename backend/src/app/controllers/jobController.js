const { Job, Employer } = require("../../../models");
const { Op } = require("sequelize");


class jobController {
  async index(req, res) {
    try {
      const where = {};
      if (req.query.status) where.status = req.query.status;

      const jobs = await Job.findAll({
        where,
        include: [
          {
            model: Employer,
            as: "Employer",
            attributes: ["companyName"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const data = jobs.map((j) => {
        const json = j.toJSON();
        return {
          ...json,
          companyName: json.Employer?.companyName ?? null,
        };
      });

      return res.json(data);
    } catch (error) {
      console.error("[jobController.index] error:", error);
      return res.status(500).json({
        message: "Lỗi lấy danh sách job",
        detail: error.message,
      });
    }
  }
  async show(req, res) {
    try {
      const job = await Job.findByPk(req.params.id, {
        include: [{ model: Employer, as: "Employer", attributes: ["companyName"] }],
      });
      if (!job) return res.status(404).json({ message: "Không tìm thấy job" });

      const json = job.toJSON();
      return res.json({ ...json, companyName: json.Employer?.companyName ?? null });
    } catch (error) {
      console.error("[jobController.show] error:", error);
      return res.status(500).json({ message: "Lỗi lấy job", detail: error.message });
    }


  }
  async showJobEmployer(req, res) {
    try {
      const jobs = await Job.findAll({
        where: { employerId: req.employer.id },
        order: [["createdAt", "DESC"]], // mới nhất lên đầu
      });

      return res.json({
        employerId: req.employer.id,
        companyName: req.employer.companyName,
        jobs,
      });
    } catch (error) {
      return res.status(500).json({ error: "Lỗi lấy job", detail: error.message });
    }
  }

  async create(req, res) {
    try {
      const { employerId, ...safeBody } = req.body;

      const job = await Job.create({
        ...safeBody,
        employerId: req.employer.id,
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
  async search(req, res) {
    try {

      // bỏ khoảng trắng đầu/cuối
      const recommendJob = (req.query.recommendJob || "").trim();

      // Không có keyword trả mảng rỗng (tránh query DB)
      if (!recommendJob) return res.json([]);

      // filter(Boolean): bỏ key rỗng
      // slice(0, 12): giới hạn tối đa 12 token
      const key = recommendJob.split(/\s+/).filter(Boolean).slice(0, 12);

      // Tạo danh sách điều kiện 
      // Với mỗi token t, tạo 2 điều kiện:
      //  - title LIKE %t%
      //  - description LIKE %t%
      // flatMap để "flatten" thành 1 mảng điều kiện OR lớn
      const orConds = key.flatMap((t) => ([
        { title: { [Op.like]: `%${t}%` } },
        { description: { [Op.like]: `%${t}%` } },
      ]));

      // Query DB:
      // - Chỉ lấy job OPEN
      // - Và (title/description chứa bất kỳ token nào)
      const jobs = await Job.findAll({
        where: {
          status: "OPEN", // (OPEN/ACTIVE...)
          [Op.or]: orConds,
          // Optional: chỉ lấy job còn hạn
          // deadline: { [Op.gte]: new Date() },
        },
        include: [
          {
            model: Employer,
            as: "Employer",
            attributes: ["companyName"],
          },],
        order: [["createdAt", "DESC"]],
        limit: 3,
      });

      // Trả danh sách jobs
      return res.json(jobs);
    } catch (e) {
      // Nếu DB/Sequelize lỗi => trả 500
      return res.status(500).json({
        message: "Search job lỗi",
        detail: e.message,
      });
    }
  }
}

module.exports = new jobController();