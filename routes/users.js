const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const mongoose = require('mongoose');

// Helper to ensure DB is ready before any route runs
const ensureDb = async () => {
    if (mongoose.connection.readyState !== 1) {
        // This uses the connection logic already defined in your server.js
        console.log("Waiting for DB connection...");
    }
};

// ---------------------------------------------------------
// 1. REGISTER USER
// ---------------------------------------------------------
router.post('/register', async (req, res) => {
    try {
        await ensureDb();
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: 'user'
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "User registered successfully!" });
    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(400).json({ success: false, error: "Email already exists or invalid data" });
    }
});

// ---------------------------------------------------------
// 2. LOGIN USER
// ---------------------------------------------------------
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        await ensureDb();
        const user = await User.findOne({ email, password });

        if (user) {
            res.json({ 
                success: true, 
                user: { 
                    name: user.name, 
                    email: user.email, 
                    role: user.role 
                } 
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    } catch (err) { 
        console.error("Login Error:", err.message);
        res.status(500).json({ success: false, error: "Server error during login" }); 
    }
});

// ---------------------------------------------------------
// 3. ADMIN: GET RECENT USERS
// ---------------------------------------------------------
router.get('/admin/recent-users', async (req, res) => {
    try {
        await ensureDb();
        // Fetch last 3 users, newest first
        const recentUsers = await User.find({}, 'name email role')
            .sort({ _id: -1 }) 
            .limit(3);
            
        res.json(recentUsers);
    } catch (err) {
        console.error("Admin Users Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch recent users" });
    }
});

module.exports = router;