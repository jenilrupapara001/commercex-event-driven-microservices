const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'commercex-platform',
    brokers: [(process.env.KAFKA_BROKER || 'localhost:9092')]
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || 'shared-lib-group' });

const connectProducer = async () => {
    await producer.connect();
    console.log('Kafka Producer Connected');
};

const connectConsumer = async (groupId) => {
    const customConsumer = kafka.consumer({ groupId });
    await customConsumer.connect();
    console.log(`Kafka Consumer Connected (Group: ${groupId})`);
    return customConsumer;
};

const publishMessage = async (topic, message) => {
    await producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
    });
};

module.exports = {
    kafka,
    producer,
    connectProducer,
    connectConsumer,
    publishMessage
};
