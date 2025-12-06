const { User, Candidate, Employer, sequelize } = require("../../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

function mapRole(r) {
  if (!r) return "CANDIDATE";
  const x = String(r).toLowerCase();
  if (x === "candidate") return "CANDIDATE";
  if (x === "employer") return "EMPLOYER";
  return "CANDIDATE";
}

function pickCandidate(body = {}) {
  return {
    fullName: body.fullName ?? null,
    phone: body.phone ?? null,
    dob: body.dob ?? null,
    sex: body.sex ?? null,
    address: body.address ?? null,
    summary: body.summary ?? null,
    avatarUrl: body.avatarUrl ?? null,
  };
}

function pickEmployer(body = {}) {
  return {
    companyName: body.companyName ?? null,
    logoUrl: body.logoUrl ?? null,
    website: body.website ?? null,
    industry: body.industry ?? null,
    description: body.description ?? null,
    location: body.location ?? null,
  };
}

function requireFields(obj, fields = []) {
  const missing = [];
  for (const f of fields) {
    if (!obj || obj[f] === undefined || obj[f] === null || String(obj[f]).trim() === "") {
      missing.push(f);
    }
  }
  return missing;
}

// đăng kí
exports.register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { email, password, role, candidate, employer } = req.body;

    if (!email || !password) {
      await t.rollback();
      return res.status(400).json({ message: "Thiếu email hoặc password" });
    }
    if (String(password).length < 6) {
      await t.rollback();
      return res.status(400).json({ message: "Mật khẩu phải >= 6 ký tự" });
    }

    const normalizedRole = mapRole(role);

    // Check email tồn tại
    const oldUser = await User.findOne({ where: { email }, transaction: t });
    if (oldUser) {
      await t.rollback();
      return res.status(409).json({ message: "Email đã được sử dụng" });
    }

    // Validate theo role (fix lỗi tạo dòng NULL)
    if (normalizedRole === "CANDIDATE") {
      const missing = requireFields(candidate, ["fullName", "phone", "dob", "address"]);
      if (missing.length) {
        await t.rollback();
        return res.status(400).json({
          message: `Thiếu thông tin candidate: ${missing.join(", ")}`,
        });
      }
    }

    if (normalizedRole === "EMPLOYER") {
      const missing = requireFields(employer, ["companyName", "industry", "location"]);
      if (missing.length) {
        await t.rollback();
        return res.status(400).json({
          message: `Thiếu thông tin employer: ${missing.join(", ")}`,
        });
      }
    }

    // Tạo user
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create(
      { email, password: hashed, role: normalizedRole },
      { transaction: t }
    );

    // Tạo profile theo role (ELSE IF để chắc chắn chỉ tạo 1 loại)
    let profile = null;

    if (user.role === "CANDIDATE") {
      profile = await Candidate.create(
        { ...pickCandidate(candidate), userId: user.id },
        { transaction: t }
      );
    } else if (user.role === "EMPLOYER") {
      profile = await Employer.create(
        { ...pickEmployer(employer), userId: user.id },
        { transaction: t }
      );
    }

    // const token = jwt.sign(
    //   { id: user.id, email: user.email, role: user.role },
    //   JWT_SECRET,
    //   { expiresIn: "7d" }
    // );

    await t.commit();

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: { id: user.id, email: user.email, role: user.role },
      profile,
      // token,
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// đăng nhập
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
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};