const express = require('express');
const { createProduct, getProducts, getProductById } = require('../controllers/product.controller');
const router = express.Router();

router.route('/')
    .post(createProduct)
    .get(getProducts);

router.route('/:id')
    .get(getProductById);

module.exports = router;
