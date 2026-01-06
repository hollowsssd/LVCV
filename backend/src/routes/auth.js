const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/authController');
const oauthController = require('../app/controllers/oauthController');
const verifyController = require('../app/controllers/verifyController');
const authMiddleware = require('../app/middlewares/auth');
const { passport } = require('../app/config/passport');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ==================== Auth ====================
router.post('/register', authController.register);
router.post('/login', authController.login);

// ==================== Google OAuth ====================
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${FRONTEND_URL}/auth/login?error=google_auth_failed`
    }),
    oauthController.handleCallback
);

router.post('/set-role', authMiddleware, oauthController.setRole);

// ==================== Email Verification ====================
router.post('/send-otp', authMiddleware, verifyController.sendOtp);
router.post('/verify-otp', authMiddleware, verifyController.verifyOtp);
router.get('/verification-status', authMiddleware, verifyController.getStatus);

module.exports = router;