// =====================================================================
// AdVia Backend — Auth Middleware
// =====================================================================
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Verifies the Bearer token and attaches `req.user` = { id, role, email, name }.
 * Usage: router.get('/path', protect, handler)
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query(
      'SELECT id, name, email, role, phone FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
}

/**
 * Restricts a route to specific roles.
 * Usage: router.post('/path', protect, requireRole('advertiser'), handler)
 * @param  {...string} roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires role: ${roles.join(' or ')}` });
    }
    next();
  };
}

module.exports = { protect, requireRole };
