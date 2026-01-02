const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Ensure models/user.js uses the 'mongoose.models.User || ...' logic

// 1. POST: Register User
// Note: If using Google Login, this is for manual email/password registration
router.post('/register', async (req, res) => {
    try {
        const newUser = new User(req.body); 
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        // Usually fails if the email already exists in the database
        res.status(400).json({ error: "Email already exists" });
    }
});

// 2. POST: Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Finding user by matching both email and plain-text password
        const user = await User.findOne({ email, password });
        if (user) {
            res.json({ 
                success: true, 
                user: { name: user.name, email: user.email, role: user.role } 
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) { 
        res.status(500).json({ error: "Server error" }); 
    }
});

// 3. GET: Get the 3 most recent users for Admin Dashboard
router.get('/admin/recent-users', async (req, res) => {
    try {
        // Fetches only name, email, and role; excludes password for security
        const recentUsers = await User.find({}, 'name email role')
            .sort({ _id: -1 }) // Sort by newest first
            .limit(3);
        res.json(recentUsers);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

module.exports = router;