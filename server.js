const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/productsdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schema and Model
const productSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: String,
    price: Number
});

const Product = mongoose.model('Product', productSchema);

// Optional: Initialize DB with one product
app.get('/init', async (req, res) => {
    const exists = await Product.findOne({ id: 1 });
    if (!exists) {
        await Product.create({ id: 1, name: 'Laptop', price: 999 });
    }
    res.send('Sample product initialized');
});

// GET all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching products' });
    }
});

// POST new product
app.post('/products', async (req, res) => {
    try {
        const { id, name, price } = req.body;
        const newProduct = new Product({ id, name, price });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ error: 'Error creating product', details: err.message });
    }
});

// PUT update product by id
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;

    try {
        const updated = await Product.findOneAndUpdate(
            { id: parseInt(id) },
            { name, price },
            { new: true }
        );

        if (updated) {
            res.json(updated);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        res.status(400).json({ error: 'Update failed', details: err.message });
    }
});

// DELETE product by id
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await Product.findOneAndDelete({ id: parseInt(id) });

        if (deleted) {
            res.json({ message: 'Product deleted' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Delete failed', details: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
