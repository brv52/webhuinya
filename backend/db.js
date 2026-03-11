const { Pool } = require('pg');
require('dotenv').config();
const logger = require('./logger');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => {
  logger.info('Database connection pool established');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle database client', { 
    error: err.message, 
    stack: err.stack 
  });
  process.exit(-1);
});

module.exports = pool;