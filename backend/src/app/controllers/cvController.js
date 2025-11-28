const { Cvs } = require('../../../models')
const cvWorker = require("../services/cvWorker");

class cvController {
    async rateCV(req, res) {
        try {
            if (!req.file) return res.status(400).json({ message: "Thiếu file CV" });

            const result = await cvWorker.runJob({
                mime: req.file.mimetype,
                buffer: req.file.buffer,
                job_title: req.body.job_title,
            });

            return res.json(result);
        } catch (e) {
            return res.status(500).json({ message: "Chấm CV lỗi", detail: e.message });
        }
    }


}

module.exports = new cvController();