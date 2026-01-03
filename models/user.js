const mongoose = require('mongoose');

// Define the Schema
const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
    type: String, 
    required: false 
    },
    role: { 
        type: String, 
        default: 'user' 
    },
    googleId: { 
        type: String 
    }
}, { timestamps: true });

// CRITICAL: This pattern prevents "OverwriteModelError" on Vercel
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;