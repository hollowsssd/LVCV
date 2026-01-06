const { User, Candidate, Employer, sequelize } = require("../../../models");
const { generateToken } = require("../config/passport");

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Xử lý callback sau khi người dùng đăng nhập thông qua Google
exports.handleCallback = (req, res) => {
    try {
        const token = generateToken(req.user);
        const user = req.user;

        const needsRoleSelection = !user.role;

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
};

// Đặt role cho người dùng OAuth chưa chọn role
exports.setRole = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const userId = req.user.id;
        const { role, profileData } = req.body;

        const normalizedRole = role?.toUpperCase();
        if (!['CANDIDATE', 'EMPLOYER'].includes(normalizedRole)) {
            await t.rollback();
            return res.status(400).json({ message: 'Role không hợp lệ' });
        }

        const user = await User.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        if (user.role) {
            await t.rollback();
            return res.status(400).json({ message: 'User đã có role' });
        }

        await user.update({ role: normalizedRole }, { transaction: t });

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
};
