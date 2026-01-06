const { User } = require("../../../models");
const { generateOtp, sendOtpEmail } = require("../../utils/email");

// Gửi OTP đến email người dùng
exports.sendOtp = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email đã được xác thực' });
        }

        const otp = generateOtp();
        const expires = new Date(Date.now() + 10 * 60 * 1000);

        await user.update({
            emailVerificationOtp: otp,
            emailVerificationExpires: expires
        });

        await sendOtpEmail(user.email, otp);

        return res.json({ message: 'Đã gửi mã OTP đến email của bạn' });

    } catch (error) {
        console.error('Send OTP error:', error);
        return res.status(500).json({ message: 'Không thể gửi email. Vui lòng thử lại.' });
    }
};

// Xác thực OTP
exports.verifyOtp = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otp } = req.body;

        if (!otp || String(otp).length !== 6) {
            return res.status(400).json({ message: 'Mã OTP không hợp lệ' });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email đã được xác thực' });
        }

        if (user.emailVerificationOtp !== String(otp)) {
            return res.status(400).json({ message: 'Mã OTP không đúng' });
        }

        if (!user.emailVerificationExpires || new Date() > user.emailVerificationExpires) {
            return res.status(400).json({ message: 'Mã OTP đã hết hạn. Vui lòng gửi lại.' });
        }

        await user.update({
            emailVerified: true,
            emailVerificationOtp: null,
            emailVerificationExpires: null
        });

        return res.json({ message: 'Xác thực email thành công!' });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy trạng thái xác thực email
exports.getStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['emailVerified', 'provider']
        });

        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        return res.json({
            emailVerified: user.emailVerified || false,
            provider: user.provider || 'local'
        });

    } catch (error) {
        console.error('Get verification status error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
};
