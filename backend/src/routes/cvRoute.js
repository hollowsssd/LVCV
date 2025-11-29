// src/routes/cvRoute.js
const express = require("express");
const router = express.Router();
const cvController = require("../app/controllers/cvController");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(process.cwd(), "uploads", "cvs");
fs.mkdirSync(uploadDir, { recursive: true });
const allowedExt = new Set([".pdf", ".doc", ".docx"]);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });



const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (!allowedExt.has(ext)) {
      req._fileRejectReason = `Đuôi file không hợp lệ (${ext || "unknown"}). Chỉ nhận PDF/DOC/DOCX.`;
      return cb(null, false);
    }
    cb(null, true);
  },
});

const safeUnlink = (p) => p && fs.unlink(p, () => {});

// ===== magic bytes helpers =====
const readBytes = (filePath, n) => {
  const fd = fs.openSync(filePath, "r");
  try {
    const buf = Buffer.alloc(n);
    const bytesRead = fs.readSync(fd, buf, 0, n, 0);
    return buf.slice(0, bytesRead);
  } finally {
    fs.closeSync(fd);
  }
};

const isPdf = (p) => readBytes(p, 5).toString("ascii") === "%PDF-";
const isDoc = (p) => {
  const header = readBytes(p, 8);
  const ole = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  return header.length === 8 && header.equals(ole);
};
const isDocx = (p) => {
  const header = readBytes(p, 4);
  const pk = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
  return header.length === 4 && header.equals(pk);
};

function isValidByExtAndMagic(filePath, originalname) {
  const ext = path.extname(originalname || "").toLowerCase();
  if (ext === ".pdf") return isPdf(filePath);
  if (ext === ".doc") return isDoc(filePath);
  if (ext === ".docx") return isDocx(filePath);
  return false;
}

// ===== upload middleware =====
const handleUpload = (required) => (req, res, next) => {
  upload.single("cv")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "File quá lớn. Tối đa 10MB." });
      }
      return res.status(400).json({ message: err.message || "Upload lỗi" });
    }

    if (required && !req.file) {
      return res.status(400).json({
        message: req._fileRejectReason || "Thiếu file CV (field: cv)",
      });
    }

    // update: không có file thì ok
    if (!req.file) return next();

    // có file -> check magic bytes
    if (!isValidByExtAndMagic(req.file.path, req.file.originalname)) {
      safeUnlink(req.file.path);
      return res.status(400).json({
        message: "Nội dung file không đúng định dạng PDF/DOC/DOCX (file giả/đổi đuôi).",
      });
    }

    next();
  });
};

// ===== Routes =====
router.post("/rate-cv", upload.single("cvfile"), cvController.rateCV);
router.get("/", cvController.index);
router.get("/:id", cvController.show);

router.post("/", handleUpload(true), cvController.create);
router.put("/:id", handleUpload(false), cvController.update);

router.delete("/:id", cvController.delete);

module.exports = router;
