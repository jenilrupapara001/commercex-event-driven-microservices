const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const { createLogger, requestLogger, connectProducer } = require('shared-lib');
const connectDB = require('./config/db');
const orderRoutes = require('./routes/order.routes');

dotenv.config();

connectDB();
connectProducer();

const app = express();
const PORT = process.env.PORT || 3003;

// Logger
const logger = createLogger('order-service');

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
app.use(requestLogger(logger));

// Routes
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
    res.status(200).json({ status: 'UP', service: 'order-service', db: dbStatus });
});

app.use('/orders', orderRoutes);

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(`order-service running on port ${PORT}`);
    });
}

module.exports = app;
