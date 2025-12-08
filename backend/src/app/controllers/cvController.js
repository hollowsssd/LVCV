const path = require("path");
const fs = require("fs");
const { Cv } = require("../../../models");
const cvWorker = require("../services/cvWorker");

const UPLOADS_BASE = path.join(process.cwd(), "uploads");

const safeUnlink = (p) => p && fs.unlink(p, () => {});

function removeLocalFileByUrl(fileUrl) {
  if (!fileUrl) return;

  let pathname = fileUrl;
  try {
    pathname = new URL(fileUrl).pathname;
  } catch (_) {}

  // /uploads/cvs/xxx.pdf -> cvs/xxx.pdf
  const relative = pathname.replace(/^\/uploads\/?/, "");
  const absolute = path.normalize(path.join(UPLOADS_BASE, relative));

  // chặn path traversal
  if (!absolute.startsWith(UPLOADS_BASE + path.sep)) return;

  if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
}

const toBool = (v) =>
  typeof v === "boolean"
    ? v
    : typeof v === "string"
    ? v.toLowerCase() === "true"
    : undefined;

const toNum = (v) =>
  v === undefined || v === null || v === "" ? undefined : Number(v);

function buildPayload(body, file) {
  const payload = {};

  if ("title" in body) payload.title = body.title ?? null;
  // if ("candidateId" in body) payload.candidateId = toNum(body.candidateId) ?? null; // khong cho client tu set candidateID ,co tao midd require Candi r

  const isDefault = toBool(body.isDefault);
  if (isDefault !== undefined) payload.isDefault = isDefault;

  // if (body.score != null) payload.score = toNum(body.score);// khong luu diem trong db
  if ("feedback" in body) payload.feedback = body.feedback ?? null;

  if (file) {
    payload.fileUrl = `/uploads/cvs/${file.filename}`;
    payload.fileType = path.extname(file.originalname).slice(1).toLowerCase(); // pdf/doc/docx
  }

  return payload;
}

class cvController {
  async index(req, res) {
    try {
      const cvs = await Cv.findAll();
      return res.json(cvs);
    } catch {
      return res.status(500).json({ error: "Lỗi lấy danh sách cv" });
    }
  }

  async show(req, res) {
    try {
      const cv = await Cv.findByPk(req.params.id);
      if (!cv) return res.status(404).json({ message: "Không tìm thấy cv" });
      return res.json(cv);
    } catch {
      return res.status(500).json({ error: "Lỗi lấy cv" });
    }
  }

  async create(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Thiếu file CV (field: cv)" });
      }

      const payload = buildPayload(req.body, req.file);

      payload.candidateId = req.candidate.id;

      const cv = await Cv.create(payload);
      return res.status(201).json(cv);
    } catch (e) {
      // DB fail thì dọn file mới up
      safeUnlink(req.file?.path);
      return res.status(400).json({ error: e.message || "Lỗi tạo cv" });
    }
  }

  async update(req, res) {
    const cv = await Cv.findByPk(req.params.id);
    if (!cv) {
      safeUnlink(req.file?.path);
      return res.status(404).json({ message: "Không tìm thấy cv" });
    }

    const oldFileUrl = cv.fileUrl;
    const payload = buildPayload(req.body, req.file);
    payload.candidateId = cv.candidateId;
    try {
      await cv.update(payload);

      // chỉ xoá file cũ sau khi update OK
      if (req.file) removeLocalFileByUrl(oldFileUrl);

      return res.json(cv);
    } catch (e) {
      // update fail thì dọn file mới up
      safeUnlink(req.file?.path);
      return res.status(400).json({ error: e.message || "Lỗi cập nhật cv" });
    }
  }

  async delete(req, res) {
    try {
      const cv = await Cv.findByPk(req.params.id);
      if (!cv) return res.status(404).json({ message: "Không tìm thấy cv" });

      removeLocalFileByUrl(cv.fileUrl);
      await cv.destroy();

      return res.json({ message: "Xóa thành công" });
    } catch {
      return res.status(500).json({ error: "Lỗi xóa cv" });
    }
  }
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
      return res
        .status(500)
        .json({ message: "Chấm CV lỗi", detail: e.message });
    }
  }
}

module.exports = new cvController();
