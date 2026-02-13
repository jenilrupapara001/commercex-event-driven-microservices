const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const { createLogger, requestLogger, connectConsumer, connectProducer, TOPICS } = require('shared-lib');
const connectDB = require('./config/db');
const { processOrderEvent } = require('./services/payment.processor');

dotenv.config();

connectDB();

const startService = async () => {
    await connectProducer();
    const consumer = await connectConsumer('payment-service-group');
    await consumer.subscribe({ topic: TOPICS.ORDER_CREATED, fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const eventData = JSON.parse(message.value.toString());
            await processOrderEvent(eventData);
        },
    });
};

startService();

const app = express();
const PORT = process.env.PORT || 3004;

// Logger
const logger = createLogger('payment-service');

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
    res.status(200).json({ status: 'UP', service: 'payment-service', db: dbStatus });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(`payment-service running on port ${PORT}`);
    });
}

module.exports = app;
