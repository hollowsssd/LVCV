const { Application } = require('../../../models');

class applicationController {
    // GET /api/applications
    async index(req, res) {
        try {
            const applications = await Application.findAll();
            res.json(applications);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi lấy danh sách application' });
        }
    }

    // GET /api/applications/:id
    async show(req, res) {
        try {
            const application = await Application.findByPk(req.params.id);
            if (!application) return res.status(404).json({ message: 'Không tìm thấy application' });
            res.json(application);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi lấy application' });
        }
    }

    // POST /api/applications
    async create(req, res) {
        try {
            const application = await Application.create(req.body);
            res.status(201).json(application);
        } catch (error) {
            res.status(400).json({ error: 'Lỗi tạo application' });
        }
    }

    // PUT /api/applications/:id
    async update(req, res) {
        try {
            const application = await Application.findByPk(req.params.id);
            if (!application) return res.status(404).json({ message: 'Không tìm thấy application' });

            await application.update(req.body);
            res.json(application);
        } catch (error) {
            res.status(400).json({ error: 'Lỗi cập nhật application' });
        }
    }

    // DELETE /api/applications/:id
    async delete(req, res) {
        try {
            const application = await Application.findByPk(req.params.id);
            if (!application) return res.status(404).json({ message: 'Không tìm thấy application' });

            await application.destroy();
            res.json({ message: 'Xóa thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi xóa application' });
        }
    }
}

module.exports = new applicationController();
