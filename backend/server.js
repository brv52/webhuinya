const app = require('./app');
const logger = require('./logger');
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Backend API server started on port ${PORT} [Mode: ${process.env.NODE_ENV || 'development'}]`);
});

process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});