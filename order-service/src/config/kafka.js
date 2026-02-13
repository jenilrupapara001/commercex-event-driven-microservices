const { Kafka } = require('kafkajs');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'order-service' },
    transports: [new winston.transports.Console()],
});

const kafka = new Kafka({
    clientId: 'order-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();

const connectProducer = async () => {
    try {
        await producer.connect();
        logger.info('Kafka Producer Connected');
    } catch (error) {
        logger.error(`Kafka Connection Error: ${error.message}`);
    }
};

const publishEvent = async (topic, message) => {
    try {
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
        logger.info(`Event published to ${topic}`);
    } catch (error) {
        logger.error(`Error publishing to ${topic}: ${error.message}`);
    }
};

module.exports = { connectProducer, publishEvent };
