const { Employer } = require('../../../models');

class employerController {
    // GET /api/employers
    async index(req, res) {
        try {
            const employers = await Employer.findAll();
            res.json(employers);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi lấy danh sách employer' });
        }
    }

    // GET /api/employers/:id
    async show(req, res) {
        try {
            const employer = await Employer.findByPk(req.params.id);
            if (!employer) return res.status(404).json({ message: 'Không tìm thấy employer' });
            res.json(employer);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi lấy employer' });
        }
    }

    // POST /api/employers
    async create(req, res) {
        try {
            const employer = await Employer.create(req.body);
            res.status(201).json(employer);
        } catch (error) {
            res.status(400).json({ error: 'Lỗi tạo employer' });
        }
    }

    // PUT /api/employers/:id
    async update(req, res) {
        try {
            const employer = await Employer.findByPk(req.params.id);
            if (!employer) return res.status(404).json({ message: 'Không tìm thấy employer' });

            await employer.update(req.body);
            res.json(employer);
        } catch (error) {
            res.status(400).json({ error: 'Lỗi cập nhật employer' });
        }
    }

    // DELETE /api/employers/:id
    async delete(req, res) {
        try {
            const employer = await Employer.findByPk(req.params.id);
            if (!employer) return res.status(404).json({ message: 'Không tìm thấy employer' });

            await employer.destroy();
            res.json({ message: 'Xóa thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi xóa employer' });
        }
    }
}

module.exports = new employerController();

