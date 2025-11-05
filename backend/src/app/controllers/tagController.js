const { Tag } = require('../../../models');

class tagController {
    // GET /api/tags
    async index(req, res) {
        try {
            const tags = await Tag.findAll();
            res.json(tags);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi lấy danh sách tag' });
        }
    }

    // GET /api/tags/:id
    async show(req, res) {
        try {
            const tag = await Tag.findByPk(req.params.id);
            if (!tag) return res.status(404).json({ message: 'Không tìm thấy tag' });
            res.json(tag);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi lấy tag' });
        }
    }

    // POST /api/tags
    async create(req, res) {
        try {
            const tag = await Tag.create(req.body);
            res.status(201).json(tag);
        } catch (error) {
            res.status(400).json({ error: 'Lỗi tạo tag' });
        }
    }

    // PUT /api/tags/:id
    async update(req, res) {
        try {
            const tag = await Tag.findByPk(req.params.id);
            if (!tag) return res.status(404).json({ message: 'Không tìm thấy tag' });

            await tag.update(req.body);
            res.json(tag);
        } catch (error) {
            res.status(400).json({ error: 'Lỗi cập nhật tag' });
        }
    }

    // DELETE /api/tags/:id
    async delete(req, res) {
        try {
            const tag = await Tag.findByPk(req.params.id);
            if (!tag) return res.status(404).json({ message: 'Không tìm thấy tag' });

            await tag.destroy();
            res.json({ message: 'Xóa thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi xóa tag' });
        }
    }
}

module.exports = new tagController();
