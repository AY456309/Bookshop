const express = require('express');
const router = express.Router();
const User = require('../models/user'); 

// ---------------------------------------------------------
// 1. REGISTER USER
// ---------------------------------------------------------
router.post('/register', async (req, res) => {
    try {
        // Create new user with data from the registration form
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password, // Plain text for now
            role: 'user' // Default role
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "User registered successfully!" });
    } catch (err) {
        console.error("Registration Error:", err.message);
        // MongoDB unique constraint error usually means email is taken
        res.status(400).json({ success: false, error: "Email already exists or invalid data" });
    }
});

// ---------------------------------------------------------
// 2. LOGIN USER
// ---------------------------------------------------------
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user exists with matching email AND password
        const user = await User.findOne({ email, password });

        if (user) {
            // Send back only the necessary data for the frontend localStorage
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
// This route is called by your admin.js frontend
router.get('/admin/recent-users', async (req, res) => {
    try {
        // Fetch last 3 users, only selecting fields needed for the dashboard
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