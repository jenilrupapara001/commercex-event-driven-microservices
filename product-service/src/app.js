const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const productRoutes = require('./routes/product.routes');

dotenv.config();

connectDB();
connectRedis();

const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3002;

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);

// Logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'product-service' },
    transports: [
        new winston.transports.Console()
    ],
});

// Request Logger Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// Routes
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
    res.status(200).json({ status: 'UP', service: 'product-service', db: dbStatus });
});

app.use('/products', productRoutes);

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(`product-service running on port ${PORT}`);
    });
}

module.exports = app;
