const { Kafka } = require('kafkajs');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'inventory-service' },
    transports: [new winston.transports.Console()],
});

const kafka = new Kafka({
    clientId: 'inventory-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'inventory-service-group' });

const connectKafka = async () => {
    try {
        await consumer.connect();
        logger.info('Kafka Consumer Connected');
    } catch (error) {
        logger.error(`Kafka Connection Error: ${error.message}`);
    }
};

const subscribeToTopic = async (topic, messageHandler) => {
    try {
        await consumer.subscribe({ topic, fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const value = message.value.toString();
                logger.info(`Received message from ${topic}`);
                await messageHandler(JSON.parse(value));
            },
        });
    } catch (error) {
        logger.error(`Error subscribing to ${topic}: ${error.message}`);
    }
};

module.exports = { connectKafka, subscribeToTopic };
