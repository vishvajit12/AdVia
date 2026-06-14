// =====================================================================
// AdVia Backend — JWT helper
// =====================================================================
const jwt = require('jsonwebtoken');

/**
 * Sign a JWT for a user.
 * @param {object} payload - e.g. { id, role }
 * @returns {string} signed JWT
 */
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = generateToken;
