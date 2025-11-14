const { User, sequelize } = require('../../../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

function mapRole(r) {
  if (!r) return "CANDIDATE";

  r = r.toLowerCase();

  if (["user", "candidate"].includes(r)) return "CANDIDATE";
  if (["recruiter", "employer"].includes(r)) return "EMPLOYER";

  return "CANDIDATE";
}

// ================= REGISTER =================
exports.register = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      await t.rollback();
      return res.status(400).json({ message: "Thiếu email hoặc password" });
    }

    if (password.length < 6) {
      await t.rollback();
      return res.status(400).json({ message: "Mật khẩu phải >= 6 ký tự" });
    }

    // Check email tồn tại
    const oldUser = await User.findOne({ where: { email } });
    if (oldUser) {
      await t.rollback();
      return res.status(409).json({ message: "Email đã được sử dụng" });
    }

    // Tạo user
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      email,
      password: hashed,
      role: mapRole(role)
    }, { transaction: t });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    await t.commit();

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: { id: user.id, email: user.email, role: user.role },
      token
    });

  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu thông tin đăng nhập" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Sai mật khẩu" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Đăng nhập thành công",
      user: { id: user.id, email: user.email, role: user.role },
      token
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};