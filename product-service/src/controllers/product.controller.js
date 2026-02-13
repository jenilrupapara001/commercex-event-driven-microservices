const Product = require('../models/product.model');
const { redisClient } = require('../config/redis');

// @desc    Create a product
// @route   POST /products
// @access  Public (for now)
const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category } = req.body;

        const product = await Product.create({
            name,
            description,
            price,
            stock,
            category
        });

        // Invalidate cache
        await redisClient.del('products:all');

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all products
// @route   GET /products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const cacheKey = 'products:all';

        // Check cache
        const cachedProducts = await redisClient.get(cacheKey);
        if (cachedProducts) {
            console.log('Cache Hit');
            return res.json(JSON.parse(cachedProducts));
        }

        console.log('Cache Miss');
        const products = await Product.find({});

        // Set cache (1 hour)
        await redisClient.set(cacheKey, JSON.stringify(products), {
            EX: 3600
        });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product
// @route   GET /products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createProduct, getProducts, getProductById };
