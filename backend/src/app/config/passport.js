const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User, sequelize } = require('../../../models');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8080/api/auth/google/callback';

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    const t = await sequelize.transaction();

    try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const name = profile.displayName;
        const avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        const providerId = profile.id;

        if (!email) {
            await t.rollback();
            return done(new Error('Không thể lấy email từ Google'), null);
        }

        // Check if user exists with this email
        let user = await User.findOne({
            where: { email },
            transaction: t
        });

        if (user) {
            // User exists - update OAuth info if needed
            if (user.provider === 'local' && !user.providerId) {
                // Link existing local account with Google
                await user.update({
                    provider: 'google',
                    providerId: providerId,
                    avatarUrl: avatarUrl || user.avatarUrl,
                    name: name || user.name,
                    emailVerified: true // Google đã xác thực email
                }, { transaction: t });
            } else if (!user.emailVerified) {
                // Nếu user đã dùng Google nhưng chưa verified, cập nhật
                await user.update({ emailVerified: true }, { transaction: t });
            }
            await t.commit();
            return done(null, user);
        }

        // Create new user with Google OAuth (no role yet - user will select)
        user = await User.create({
            email,
            password: null, // No password for OAuth users
            role: null, // No role yet - user will select on first login
            provider: 'google',
            providerId,
            avatarUrl,
            name,
            emailVerified: true // Google đã xác thực email
        }, { transaction: t });

        // Don't create profile yet - will be created when user selects role

        await t.commit();
        return done(null, user);

    } catch (error) {
        await t.rollback();
        console.error('Google OAuth Error:', error);
        return done(error, null);
    }
}));

// Generate JWT token for user
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

module.exports = { passport, generateToken };
