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
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 
    } 
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
            bufferCommands: false 
        });
        console.log('✅ Connected to MongoDB Atlas');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
    }
};

connectDB();

// 3. SCHEMAS & MODELS (Cleaned up duplicates)
const productSchema = new mongoose.Schema({ title: String, price: Number, image: String });

const orderSchema = new mongoose.Schema({
    email: String,      // Changed from userEmail to email to match your GET route logic
    items: Array,
    totalPrice: Number,
    address: String, 
    paymentMethod: String, 
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

// Define Models only ONCE
const Product = mongoose.models.Product || mongoose.model('Product', productSchema, 'products');
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema, 'orders');

// 4. ROUTES (Imported)
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

app.use('/api', userRoutes);      
app.use('/api/auth', authRoutes); 

// 5. PRODUCT & ORDER LOGIC

// GET PRODUCTS
app.get('/api/products', async (req, res) => {
    try { 
        await connectDB(); 
        const books = await Product.find({}).lean();
        res.json(books); 
    } catch (err) { 
        res.status(500).json({ error: "Failed to fetch products" }); 
    }
});

// GET USER ORDERS (Matches orders.js)
app.get('/api/orders/:email', async (req, res) => {
    try {
        await connectDB();
        const userEmail = req.params.email;
        // Search the "email" field in the database
        const orders = await Order.find({ email: userEmail }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// POST NEW ORDER
app.post('/api/orders', async (req, res) => {
    try {
        await connectDB();
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ success: true, orderId: newOrder._id });
    } catch (err) { 
        res.status(500).json({ success: false, error: err.message }); 
    }
});

// 6. CATCH-ALL ROUTE (KEEPING YOUR WORKING LOGIC)
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: "API endpoint not found" });
    }

    const indexPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.status(404).send("Frontend file not found");
        }
    });
});

module.exports = app;