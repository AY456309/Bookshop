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
    cookie: { secure: process.env.NODE_ENV === 'production' } 
}));

app.use(passport.initialize());
app.use(passport.session());

// 2. DATABASE CONNECTION (Optimized for Timeouts)
mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
        console.log("📡 Connecting to MongoDB Atlas...");
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            family: 4 // Force IPv4 to prevent local timeout issues
        });
        console.log('✅ Connected to MongoDB Atlas successfully!');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        // Do not crash the process in development, but warn clearly
    }
};

connectDB();

// 3. MODELS
const productSchema = new mongoose.Schema({
    title: String, 
    price: Number, 
    image: String
});

const orderSchema = new mongoose.Schema({
    userEmail: String, 
    items: Array, 
    totalPrice: Number, 
    address: String, 
    paymentMethod: String, 
    status: { type: String, default: 'Pending' },
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
        const books = await Product.find();
        res.json(books);
    } catch (err) { 
        res.status(500).json({ error: "Failed to fetch products" }); 
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) { 
        res.status(400).json({ error: "Failed to add product" }); 
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted" });
    } catch (err) { 
        res.status(500).json({ error: "Failed to delete product" }); 
    }
});

app.get('/api/orders/:email', async (req, res) => {
    try {
        const userOrders = await Order.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
        res.json(userOrders);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ success: true, message: "Order placed!", orderId: newOrder._id });
    } catch (err) { 
        res.status(500).json({ success: false, error: "Order failed" }); 
    }
});

// 6. CATCH-ALL ROUTE
app.get('*', (req, res, next) => {
    // Prevent catching /api routes
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 7. EXPORT / LISTEN
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;