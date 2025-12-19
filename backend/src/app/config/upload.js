// src/app/config/upload.js
// Cấu hình Multer cho upload ảnh (avatar, logo)

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const PROJECT_ROOT = path.resolve(__dirname, "../../../../");

// Các đuôi file ảnh được phép
const allowedImageExt = new Set([".jpg", ".jpeg", ".png"]);

// Đọc magic bytes để xác thực định dạng ảnh thật
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

const isJpeg = (p) => {
    const header = readBytes(p, 3);
    return header.length >= 2 && header[0] === 0xFF && header[1] === 0xD8;
};

const isPng = (p) => {
    const header = readBytes(p, 8);
    const pngSig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    return header.length === 8 && header.equals(pngSig);
};

function isValidImageByMagic(filePath, originalname) {
    const ext = path.extname(originalname || "").toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") return isJpeg(filePath);
    if (ext === ".png") return isPng(filePath);
    return false;
}

const safeUnlink = (p) => p && fs.unlink(p, () => { });

// Tạo thư mục upload nếu chưa tồn tại
const avatarsDir = path.join(PROJECT_ROOT, "uploads", "avatars");
const logoDir = path.join(PROJECT_ROOT, "uploads", "logos");
fs.mkdirSync(avatarsDir, { recursive: true });
fs.mkdirSync(logoDir, { recursive: true });

// Cấu hình lưu trữ cho avatar
const avatarStorage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, avatarsDir),
    filename: (_, file, cb) => {
        const safe = file.originalname.replace(/[^\w.\-]/g, "_");
        cb(null, `${Date.now()}-${safe}`);
    },
});

// Cấu hình lưu trữ cho logo
const logoStorage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, logoDir),
    filename: (_, file, cb) => {
        const safe = file.originalname.replace(/[^\w.\-]/g, "_");
        cb(null, `${Date.now()}-${safe}`);
    },
});

// Bộ lọc file ảnh theo đuôi file
const imageFileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (!allowedImageExt.has(ext)) {
        req._fileRejectReason = `Đuôi file không hợp lệ (${ext || "unknown"}). Chỉ nhận JPG/JPEG/PNG.`;
        return cb(null, false);
    }
    cb(null, true);
};

// Khởi tạo multer instances
const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: imageFileFilter,
});

const uploadLogo = multer({
    storage: logoStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: imageFileFilter,
});

// Middleware wrapper kèm kiểm tra magic bytes
const handleImageUpload = (multerInstance, fieldName) => (req, res, next) => {
    multerInstance.single(fieldName)(req, res, (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({ message: "File quá lớn. Tối đa 5MB." });
            }
            return res.status(400).json({ message: err.message || "Upload lỗi" });
        }

        if (!req.file) {
            return res.status(400).json({
                message: req._fileRejectReason || `Thiếu file ảnh (field: ${fieldName})`,
            });
        }

        // Kiểm tra magic bytes để đảm bảo file ảnh thật
        if (!isValidImageByMagic(req.file.path, req.file.originalname)) {
            safeUnlink(req.file.path);
            return res.status(400).json({
                message: "Nội dung file không đúng định dạng ảnh (file giả/đổi đuôi).",
            });
        }

        next();
    });
};

module.exports = {
    uploadAvatar,
    uploadLogo,
    handleImageUpload,
    safeUnlink,
    avatarsDir,
    logoDir,
};
