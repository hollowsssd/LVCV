const { Candidate } = require('../../../models');

class candidateController {
    // GET /api/candidates
    async index(req, res) {
        try {
            const candidates = await Candidate.findAll();
            res.json(candidates);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi lấy danh sách candidate' });
        }
    }

    // GET /api/candidates/:id
    async show(req, res) {
        try {
            const candidate = await Candidate.findByPk(req.params.id);
            if (!candidate) return res.status(404).json({ message: 'Không tìm thấy candidate' });
            res.json(candidate);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi lấy candidate' });
        }
    }

    // POST /api/candidates
    async create(req, res) {
        try {
            const candidate = await Candidate.create(req.body);
            res.status(201).json(candidate);
        } catch (error) {
            res.status(400).json({ error: 'Lỗi tạo candidate' });
        }
    }

    // PUT /api/candidates/:id
    async update(req, res) {
        try {
            const candidate = await Candidate.findByPk(req.params.id);
            if (!candidate) return res.status(404).json({ message: 'Không tìm thấy candidate' });

            await candidate.update(req.body);
            res.json(candidate);
        } catch (error) {
            res.status(400).json({ error: 'Lỗi cập nhật candidate' });
        }
    }

    // DELETE /api/candidates/:id
    async delete(req, res) {
        try {
            const candidate = await Candidate.findByPk(req.params.id);
            if (!candidate) return res.status(404).json({ message: 'Không tìm thấy candidate' });

            await candidate.destroy();
            res.json({ message: 'Xóa thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi xóa candidate' });
        }
    }
}

module.exports = new candidateController();
