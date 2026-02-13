const { createLogger } = require('./utils/logger');
const { requestLogger } = require('./middleware/requestLogger');
const { kafka, producer, connectProducer, connectConsumer, publishMessage } = require('./kafka/client');
const { TOPICS } = require('./events/topics');

module.exports = {
    createLogger,
    requestLogger,
    kafka,
    producer,
    connectProducer,
    connectConsumer,
    publishMessage,
    TOPICS
};
