const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createLogger, requestLogger } = require('shared-lib');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Logger
const logger = createLogger('api-gateway');

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
    res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

app.use('/users', (req, res) => res.redirect(`http://localhost:3001${req.originalUrl}`));

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        logger.info(`api-gateway running on port ${PORT}`);
    });
}

module.exports = app;
