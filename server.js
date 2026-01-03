const path = require('path');
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

const app = express();

// 1. MIDDLEWARE
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'bookshop_temp_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } 
}));
app.use(passport.initialize());
app.use(passport.session());

// 2. DATABASE CONNECTION
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'bookreview',
            serverSelectionTimeoutMS: 10000, 
        });
        console.log('✅ Connected to MongoDB Atlas');
    } catch (err) { console.error('❌ MongoDB Connection Error:', err.message); }
};
connectDB();

// 3. SCHEMAS & MODELS (Defined once)
const productSchema = new mongoose.Schema({ title: String, price: Number, image: String });
const orderSchema = new mongoose.Schema({
    email: String,
    items: Array,
    totalPrice: Number,
    address: String, 
    paymentMethod: String, 
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema, 'products');
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema, 'orders');

// 4. ROUTES (Importing after models are defined)
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

app.use('/api', userRoutes);      
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); 

// 5. PUBLIC API LOGIC
app.get('/api/products', async (req, res) => {
    try { 
        await connectDB(); 
        const books = await Product.find({}).lean();
        res.json(books); 
    } catch (err) { res.status(500).json({ error: "Failed to fetch products" }); }
});

app.get('/api/orders/:email', async (req, res) => {
    try {
        await connectDB();
        const orders = await Order.find({ email: req.params.email }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) { res.status(500).json({ success: false, message: "Database error" }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        await connectDB();
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ success: true, orderId: newOrder._id });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 7. CATCH-ALL
app.use((req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: "API not found" });
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;