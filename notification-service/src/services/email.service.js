const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'notification-service' },
    transports: [new winston.transports.Console()],
});

const sendOrderConfirmation = async (paymentData) => {
    try {
        const { orderId, userId, status } = paymentData;

        if (status === 'SUCCESS') {
            logger.info(`Preparing email for Order ID: ${orderId}...`);
            // Simulate email sending delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            logger.info(`[EMAIL SENT] Order Confirmation sent to User ID: ${userId} for Order: ${orderId}`);
        }

    } catch (error) {
        logger.error(`Error sending email: ${error.message}`);
    }
};

module.exports = { sendOrderConfirmation };
