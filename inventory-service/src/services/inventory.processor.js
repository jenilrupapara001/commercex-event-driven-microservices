const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'inventory-service' },
    transports: [new winston.transports.Console()],
});

const processPaymentEvent = async (paymentData) => {
    try {
        const { orderId, status } = paymentData;

        if (status === 'SUCCESS') {
            logger.info(`Payment successful for Order ID: ${orderId}. Deducting stock...`);
            // Simulate stock deduction delay
            await new Promise(resolve => setTimeout(resolve, 500));
            logger.info(`Stock deducted for Order ID: ${orderId}`);
        } else {
            logger.warn(`Payment failed for Order ID: ${orderId}. No stock deduction.`);
        }

    } catch (error) {
        logger.error(`Error processing inventory update: ${error.message}`);
    }
};

module.exports = { processPaymentEvent };
