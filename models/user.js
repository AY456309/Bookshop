const mongoose = require('mongoose');

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
        type: String 
    }, 
    googleId: { 
        type: String 
    },
    role: { 
        type: String, 
        default: 'user' 
    } 
}, { timestamps: true }); 

// UPDATE THIS LINE BELOW:
module.exports = mongoose.models.User || mongoose.model('User', userSchema);