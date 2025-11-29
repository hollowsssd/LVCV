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

    // POST /api/jobs (EMPLOYER)
    async create(req, res) {
        try {
            // bỏ employerId FE gửi (nếu có)
            const { employerId, ...safeBody } = req.body;

            const job = await Job.create({
                ...safeBody,
                employerId: req.employer.id, // server tự set
            });

            res.status(201).json(job);
        } catch (error) {
            res.status(400).json({ error: "Lỗi tạo job", detail: error.message });
        }
    }

    // PUT /api/jobs/:id (EMPLOYER - chỉ sửa job của chính mình)
    async update(req, res) {
        try {
            const job = await Job.findByPk(req.params.id);
            if (!job) return res.status(404).json({ message: "Không tìm thấy job" });

            // chặn sửa job của employer khác
            if (job.employerId !== req.employer.id) {
                return res.status(403).json({ message: "Không có quyền sửa job này" });
            }

            // chặn đổi employerId
            const { employerId, ...safeBody } = req.body;

            await job.update(safeBody);
            res.json(job);
        } catch (error) {
            res.status(400).json({ error: "Lỗi cập nhật job", detail: error.message });
        }
    }

    // DELETE /api/jobs/:id (EMPLOYER - chỉ xóa job của chính mình)
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
