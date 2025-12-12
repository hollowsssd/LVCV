const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/authController');
const rateLimit = require("../app/middlewares/rateLimit")
const { passport, generateToken } = require('../app/config/passport');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

router.post('/register', rateLimit, authController.register);

router.post('/login', rateLimit, authController.login);

// ==================== Google OAuth Routes ====================

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${FRONTEND_URL}/auth/login?error=google_auth_failed`
    }),
    (req, res) => {
        try {
            // Generate JWT token
            const token = generateToken(req.user);
            const user = req.user;

            // Check if user needs to select role (new OAuth user)
            const needsRoleSelection = !user.role;

            // Redirect to frontend with token and user info
            const redirectUrl = new URL(`${FRONTEND_URL}/auth/oauth-callback`);
            redirectUrl.searchParams.append('token', token);
            redirectUrl.searchParams.append('email', user.email);
            redirectUrl.searchParams.append('needsRole', needsRoleSelection ? 'true' : 'false');

            if (user.role) {
                redirectUrl.searchParams.append('role', user.role.toLowerCase());
            }

            res.redirect(redirectUrl.toString());
        } catch (error) {
            console.error('OAuth callback error:', error);
            res.redirect(`${FRONTEND_URL}/auth/login?error=token_generation_failed`);
        }
    }
);

// ==================== Set Role for OAuth Users ====================
const { User, Candidate, Employer, sequelize } = require('../../models');
const authMiddleware = require('../app/middlewares/auth');

// Set role for OAuth users who haven't selected a role yet
router.post('/set-role', authMiddleware, async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const userId = req.user.id;
        const { role, profileData } = req.body;

        // Validate role
        const normalizedRole = role?.toUpperCase();
        if (!['CANDIDATE', 'EMPLOYER'].includes(normalizedRole)) {
            await t.rollback();
            return res.status(400).json({ message: 'Role không hợp lệ' });
        }

        // Find user
        const user = await User.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        // Check if user already has a role
        if (user.role) {
            await t.rollback();
            return res.status(400).json({ message: 'User đã có role' });
        }

        // Update user role
        await user.update({ role: normalizedRole }, { transaction: t });

        // Create profile based on role
        let profile = null;
        if (normalizedRole === 'CANDIDATE') {
            profile = await Candidate.create({
                userId: user.id,
                fullName: profileData?.fullName || user.name,
                phone: profileData?.phone || null,
                dob: profileData?.dob || null,
                sex: profileData?.sex || null,
                address: profileData?.address || null,
                summary: profileData?.summary || null,
                avatarUrl: user.avatarUrl
            }, { transaction: t });
        } else if (normalizedRole === 'EMPLOYER') {
            profile = await Employer.create({
                userId: user.id,
                companyName: profileData?.companyName || null,
                logoUrl: user.avatarUrl,
                website: profileData?.website || null,
                industry: profileData?.industry || null,
                description: profileData?.description || null,
                location: profileData?.location || null
            }, { transaction: t });
        }

        await t.commit();

        // Generate new token with updated role
        const token = generateToken(user);

        return res.json({
            message: 'Cập nhật role thành công',
            user: { id: user.id, email: user.email, role: normalizedRole },
            profile,
            token
        });

    } catch (error) {
        await t.rollback();
        console.error('Set role error:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
});

// ==================== Email Verification OTP ====================
const { generateOtp, sendOtpEmail } = require('../utils/email');

// Send OTP to user's email
router.post('/send-otp', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        // Check if already verified
        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email đã được xác thực' });
        }

        // Generate OTP and set expiry (10 minutes)
        const otp = generateOtp();
        const expires = new Date(Date.now() + 10 * 60 * 1000);

        // Save OTP to user
        await user.update({
            emailVerificationOtp: otp,
            emailVerificationExpires: expires
        });

        // Send email
        await sendOtpEmail(user.email, otp);

        return res.json({ message: 'Đã gửi mã OTP đến email của bạn' });

    } catch (error) {
        console.error('Send OTP error:', error);
        return res.status(500).json({ message: 'Không thể gửi email. Vui lòng thử lại.' });
    }
});

// Verify OTP
router.post('/verify-otp', authMiddleware, async (req, res) => {
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

        // Check OTP
        if (user.emailVerificationOtp !== String(otp)) {
            return res.status(400).json({ message: 'Mã OTP không đúng' });
        }

        // Check expiry
        if (!user.emailVerificationExpires || new Date() > user.emailVerificationExpires) {
            return res.status(400).json({ message: 'Mã OTP đã hết hạn. Vui lòng gửi lại.' });
        }

        // Mark as verified
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
});

// Get verification status
router.get('/verification-status', authMiddleware, async (req, res) => {
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
});

module.exports = router;