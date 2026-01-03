const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// --- GET DATA ---

// 1. Get All Orders
router.get('/orders', async (req, res) => {
    try {
        const Order = mongoose.model('Order');
        const orders = await Order.find({}).sort({ createdAt: -1 }).limit(10);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Failed to load orders" });
    }
});

// 2. Get Recent Users
router.get('/recent-users', async (req, res) => {
    try {
        const User = mongoose.models.User || require('../models/user');
        const users = await User.find({}, 'name email role').sort({ _id: -1 }).limit(5);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to load users" });
    }
});

// --- MANAGE INVENTORY ---

// 3. Add Product
router.post('/products', async (req, res) => {
    try {
        const Product = mongoose.model('Product');
        const newProduct = new Product({
            title: req.body.title,
            price: Number(req.body.price),
            image: req.body.image
        });
        await newProduct.save();
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to add product" });
    }
});

// 4. Delete Product
router.delete('/products/:id', async (req, res) => {
    try {
        const Product = mongoose.model('Product');
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

module.exports = router;