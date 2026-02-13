const { Kafka } = require('kafkajs');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'payment-service' },
    transports: [new winston.transports.Console()],
});

const kafka = new Kafka({
    clientId: 'payment-service',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'payment-service-group' });

const connectKafka = async () => {
    try {
        await producer.connect();
        await consumer.connect();
        logger.info('Kafka Producer and Consumer Connected');
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

const subscribeToTopic = async (topic, messageHandler) => {
    try {
        await consumer.subscribe({ topic, fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const value = message.value.toString();
                logger.info(`Received message from ${topic}: ${value}`);
                await messageHandler(JSON.parse(value));
            },
        });
    } catch (error) {
        logger.error(`Error subscribing to ${topic}: ${error.message}`);
    }
};

module.exports = { connectKafka, publishEvent, subscribeToTopic };
