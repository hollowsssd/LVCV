const { Job } = require('../../../models');

class jobController {
    // GET /api/jobs
    async index(req, res) {
        try {
            const jobs = await Job.findAll();
            res.json(jobs);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi lấy danh sách job' });
        }
    }

    // GET /api/jobs/:id
    async show(req, res) {
        try {
            const job = await Job.findByPk(req.params.id);
            if (!job) return res.status(404).json({ message: 'Không tìm thấy job' });
            res.json(job);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi lấy job' });
        }
    }

    // POST /api/jobs
    async create(req, res) {
        try {
            const job = await Job.create(req.body);
            res.status(201).json(job);
        } catch (error) {
            res.status(400).json({ error: 'Lỗi tạo job' });
        }
    }

    // PUT /api/jobs/:id
    async update(req, res) {
        try {
            const job = await Job.findByPk(req.params.id);
            if (!job) return res.status(404).json({ message: 'Không tìm thấy job' });

            await job.update(req.body);
            res.json(job);
        } catch (error) {
            res.status(400).json({ error: 'Lỗi cập nhật job' });
        }
    }

    // DELETE /api/jobs/:id
    async delete(req, res) {
        try {
            const job = await Job.findByPk(req.params.id);
            if (!job) return res.status(404).json({ message: 'Không tìm thấy job' });

            await job.destroy();
            res.json({ message: 'Xóa thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi xóa job' });
        }
    }
}
module.exports = new jobController();