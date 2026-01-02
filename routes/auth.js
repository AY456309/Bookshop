const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user'); // Ensure this file uses the 'mongoose.models.User || ...' fix
const router = express.Router();

// 1. CONFIGURE PASSPORT STRATEGY
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // Dynamic callback URL: Switches between Localhost and Vercel automatically
    callbackURL: process.env.NODE_ENV === 'production' 
      ? "https://bookshop-lime.vercel.app/api/auth/google/callback" 
      : "http://localhost:3000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        // Find user by email
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (!user) {
            // Create new user if they don't exist
            user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                role: 'user'
            });
            await user.save();
        } else if (!user.googleId) {
            // Link Google ID to existing email account
            user.googleId = profile.id;
            await user.save();
        }
        
        return done(null, user);
    } catch (err) { 
        return done(err, null); 
    }
  }
));

// 2. GOOGLE LOGIN ROUTE
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 3. GOOGLE CALLBACK ROUTE
router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login.html' }), 
    (req, res) => {
        const { name, email, role } = req.user;
        const encodedName = encodeURIComponent(name);
        
        // Redirect to success page (Frontend will save this to localStorage)
        res.redirect(`/login-success.html?name=${encodedName}&email=${email}&role=${role}`);
    }
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// This tells Passport how to remember the user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = router;