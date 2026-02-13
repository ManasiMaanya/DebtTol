require('dotenv').config();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./database');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const fullName = profile.displayName;
        const profilePicture = profile.photos[0]?.value || null;

        // Check if user exists
        const [existingUsers] = await db.query(
          'SELECT * FROM users WHERE google_id = ? OR email = ?',
          [googleId, email]
        );

        if (existingUsers.length > 0) {
          // User exists, update Google ID if needed
          const user = existingUsers[0];
          if (!user.google_id) {
            await db.query(
              'UPDATE users SET google_id = ?, profile_picture = ? WHERE id = ?',
              [googleId, profilePicture, user.id]
            );
          }
          return done(null, user);
        }

        // Create new user
        const [result] = await db.query(
          'INSERT INTO users (email, google_id, full_name, profile_picture, role) VALUES (?, ?, ?, ?, ?)',
          [email, googleId, fullName, profilePicture, 'user']
        );

        const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        return done(null, newUser[0]);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, users[0]);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;