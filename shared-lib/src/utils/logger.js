const winston = require('winston');

const createLogger = (serviceName) => {
    return winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        defaultMeta: { service: serviceName },
        transports: [
            new winston.transports.Console(),
        ],
    });
};

module.exports = { createLogger };
