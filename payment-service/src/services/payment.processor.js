const Payment = require('../models/payment.model');
const { publishMessage, TOPICS } = require('shared-lib');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'payment-service' },
    transports: [new winston.transports.Console()],
});

const processOrderEvent = async (orderData) => {
    try {
        const { orderId, userId, items, totalAmount } = orderData;

        logger.info(`Processing payment for Order ID: ${orderId}`);

        // Simulate payment processing delay (e.g., 2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create Payment Record (Simulating success)
        const payment = await Payment.create({
            orderId,
            userId,
            amount: totalAmount,
            status: 'SUCCESS'
        });

        logger.info(`Payment successful for Order ID: ${orderId}`);

        // Publish Payment Completed Event
        const eventPayload = {
            orderId: orderId,
            paymentId: payment._id,
            status: 'SUCCESS',
            processedAt: payment.createdAt,
            userId: userId
        };

        await publishMessage(TOPICS.PAYMENT_COMPLETED, eventPayload);

    } catch (error) {
        logger.error(`Error processing payment: ${error.message}`);
    }
};

module.exports = { processOrderEvent };
