const path = require('path');
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const app = express();

// 1. MIDDLEWARE
app.use(express.json()); 
// This line ensures Vercel serves your static assets (CSS/JS/Images) correctly
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'bookshop_temp_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    } 
}));

app.use(passport.initialize());
app.use(passport.session());

// 2. DATABASE CONNECTION
// We use a variable to prevent multiple connection attempts in Serverless
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log('✅ Connected to MongoDB Atlas...');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
    }
};

connectDB();

// 3. MODELS
const productSchema = new mongoose.Schema({ title: String, price: Number, image: String });
const orderSchema = new mongoose.Schema({
    userEmail: String, items: Array, totalPrice: Number, address: String, 
    paymentMethod: String, status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// 4. ROUTES
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

app.use('/api', userRoutes);      
app.use('/api/auth', authRoutes); 

// 5. PRODUCT & ORDER LOGIC
app.get('/api/products', async (req, res) => {
    try { 
        await connectDB(); // Ensure DB is connected for serverless
        const books = await Product.find(); 
        res.json(books); 
    } catch (err) { res.status(500).json({ error: "Failed to fetch products" }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        await connectDB();
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ success: true, message: "Order placed!", orderId: newOrder._id });
    } catch (err) { 
        res.status(500).json({ success: false, error: "Order failed" }); 
    }
});

// 6. CATCH-ALL ROUTE (Correct for Express 5 + Vercel)
app.get('/:path*', (req, res, next) => {
    // If it's an API call that reached here, it means the API doesn't exist
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: "API not found" });
    }
    // Otherwise, serve your HTML file
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// 7. EXPORT / LISTEN
const PORT = process.env.PORT || 3000;

// Vercel needs the app exported, but local dev needs app.listen
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;