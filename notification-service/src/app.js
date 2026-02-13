const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createLogger, requestLogger, connectConsumer, TOPICS } = require('shared-lib');
const { sendOrderConfirmation } = require('./services/email.service');

dotenv.config();

const startService = async () => {
    const consumer = await connectConsumer('notification-service-group');
    await consumer.subscribe({ topic: TOPICS.PAYMENT_COMPLETED, fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const eventData = JSON.parse(message.value.toString());
            await sendOrderConfirmation(eventData);
        },
    });
};

startService();

const app = express();
const PORT = process.env.PORT || 3006;

// Logger
const logger = createLogger('notification-service');

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
    res.status(200).json({ status: 'UP', service: 'notification-service' });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(`notification-service running on port ${PORT}`);
    });
}

module.exports = app;
