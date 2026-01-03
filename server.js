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

// 2. DATABASE CONNECTION (Optimized for Vercel/Serverless)
const connectDB = async () => {
    // Check if we already have a connection (1 = connected, 2 = connecting)
    if (mongoose.connection.readyState >= 1) return;

    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'bookreview', // Explicitly point to your database
            serverSelectionTimeoutMS: 10000, 
            bufferCommands: false // Stop buffering if connection is lost
        });
        console.log('✅ Connected to MongoDB Atlas (bookreview database)');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        throw err;
    }
};

// Initial connection
connectDB().catch(err => console.error("Initial DB connection failed"));

// 3. MODELS
const productSchema = new mongoose.Schema({ title: String, price: Number, image: String });
const orderSchema = new mongoose.Schema({
    userEmail: String, items: Array, totalPrice: Number, address: String, 
    paymentMethod: String, status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

// Explicitly naming the collections 'products' and 'orders'
const Product = mongoose.models.Product || mongoose.model('Product', productSchema, 'products');
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema, 'orders');

// 4. ROUTES
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

app.use('/api', userRoutes);      
app.use('/api/auth', authRoutes); 

// 5. PRODUCT & ORDER LOGIC
app.get('/api/products', async (req, res) => {
    try { 
        await connectDB(); 
        const books = await Product.find({}).lean(); // .lean() makes queries faster
        console.log(`Found ${books.length} books in bookreview`);
        res.json(books); 
    } catch (err) { 
        console.error("Fetch Error:", err.message);
        res.status(500).json({ 
            error: "Failed to fetch products", 
            message: err.message,
            dbState: mongoose.connection.readyState
        }); 
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        await connectDB();
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ success: true, message: "Order placed!", orderId: newOrder._id });
    } catch (err) { 
        res.status(500).json({ success: false, error: "Order failed", message: err.message }); 
    }
});

// 6. CATCH-ALL ROUTE (Express 5 & Vercel compatible)
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

// 7. EXPORT / LISTEN
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;