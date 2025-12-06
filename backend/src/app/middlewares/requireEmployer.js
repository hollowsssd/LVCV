const { Employer } = require("../../../models");

// Middleware: chỉ cho phép EMPLOYER truy cập và tự lấy employer.id từ user trong token
module.exports = async (req, res, next) => {
    try {
        // NOTE: auth.js phải chạy trước middleware này để set req.user từ JWT payload
        // if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });

        // // NOTE: Chặn user không phải EMPLOYER (candidate không được tạo/sửa/xoá job)
        // if (req.user.role !== "EMPLOYER") {
        //     return res.status(403).json({ message: "Chỉ EMPLOYER mới được dùng API này" });
        // }

        // NOTE: Mapping đúng quan hệ trong DB:
        // users.id (trong token) -> employers.userId -> employers.id
        // Và jobs.employerId phải nhận giá trị employers.id
        const employer = await Employer.findOne({
            where: { userId: req.user.id }, // req.user.id = users.id
            attributes: ["id", "companyName"], // NOTE: employers table chỉ có cột "id" (KHÔNG có "employerId")
        });

        // NOTE: Nếu user role EMPLOYER nhưng chưa tạo hồ sơ employer => không cho thao tác job
        if (!employer) {
            return res.status(403).json({ message: "Chưa có hồ sơ employer" });
        }

        // NOTE: Gắn employer instance vào req để controller dùng:
        // req.employer.id chính là employerId sẽ lưu vào jobs.employerId
        req.employer = employer;

        return next();
    } catch (err) {
        return res.status(500).json({ message: "Lỗi server", detail: err.message });
    }
};
