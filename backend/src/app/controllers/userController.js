const { User } = require('../../../models');

class userController {
    // GET /api/users
    async index(req, res) {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi lấy danh sách user' });
        }
    }

    // GET /api/users/:id
    async show(req, res) {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: 'Lỗi lấy user' });
        }
    }

    // POST /api/users
    async create(req, res) {
        try {
            const user = await User.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: 'Lỗi tạo user' });
        }
    }

    // PUT /api/users/:id
    async update(req, res) {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

            await user.update(req.body);
            res.json(user);
        } catch (error) {
            res.status(400).json({ error: 'Lỗi cập nhật user' });
        }
    }

    // DELETE /api/users/:id
    async delete(req, res) {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

            await user.destroy();
            res.json({ message: 'Xóa thành công' });
        } catch (error) {
            res.status(500).json({ error: 'Lỗi xóa user' });
        }
    }
}

module.exports = new userController();

