const pool = require('./db');
const bcrypt = require('bcrypt');
const logger = require('./logger');

async function seed() {
  const client = await pool.connect();
  try {
    const password = 'admin';
    const hash = await bcrypt.hash(password, 10);

    await client.query('BEGIN');

    logger.info('Starting database seeding...');

    await client.query("DELETE FROM users WHERE username = 'admin' OR email = 'admin@shop.com'");

    const userRes = await client.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id",
      ['admin', 'admin@shop.com', hash, 'admin']
    );
    const adminId = userRes.rows[0].id;

    await client.query("INSERT INTO carts (user_id) VALUES ($1)", [adminId]);

    await client.query('COMMIT');
    logger.info("Admin user and Cart created successfully.");
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error("Seeding failed", { error: err.message, stack: err.stack });
    process.exit(1);
  } finally {
    client.release();
  }
}

seed();