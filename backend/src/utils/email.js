const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Generate 6-digit OTP
 */
function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Send OTP verification email
 * @param {string} to - recipient email
 * @param {string} otp - 6-digit OTP
 */
async function sendOtpEmail(to, otp) {
    const mailOptions = {
        from: `"LVCV - AI JobMatch" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Xác thực email - LVCV',
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1e293b; margin-bottom: 16px;">Xác thực email của bạn</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Mã OTP của bạn là:
        </p>
        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px;">
          Mã này sẽ hết hạn sau <strong>10 phút</strong>.
        </p>
        <p style="color: #64748b; font-size: 13px;">
          Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">
          LVCV - AI JobMatch
        </p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = {
    generateOtp,
    sendOtpEmail,
    transporter,
};
