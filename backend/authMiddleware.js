const jwt = require('jsonwebtoken');
require('dotenv').config();
const logger = require('./logger');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn(`Auth failed: No token provided for ${req.method} ${req.url}`);
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.error(`JWT Verification Error: ${err.message}`, { token_provided: !!token });
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    logger.warn(`Unauthorized Admin Access Attempt by user ${req.user.userId}`);
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };