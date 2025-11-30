const { Job } = require("../../../models");
const { Op } = require("sequelize");


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
    async search(req, res) {
        try {
            
            // bỏ khoảng trắng đầu/cuối
            const recommendJob = (req.query.recommendJob || "").trim();

            // Không có keyword thì trả mảng rỗng luôn (tránh query DB vô ích)
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
            // - Chỉ lấy job đang OPEN
            // - Và (title/description chứa bất kỳ token nào)
            const jobs = await Job.findAll({
                where: {
                    status: "OPEN", // chỉnh theo status thực tế của mày (OPEN/ACTIVE...)
                    [Op.or]: orConds,
                    // Optional: chỉ lấy job còn hạn
                    // deadline: { [Op.gte]: new Date() },
                },
                limit: 30,
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
