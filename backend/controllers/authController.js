// =====================================================================
// AdVia Backend — Auth Controller
// Handles registration & login for both drivers and advertisers,
// plus a "/me" endpoint that returns the logged-in user's full profile.
// =====================================================================
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const generateToken = require('../utils/generateToken');

const SALT_ROUNDS = 10;

/**
 * @route   POST /api/auth/register
 * @desc    Register a new driver or advertiser
 * @access  Public
 *
 * Body (common):  { name, email, password, phone, role }
 * Body (driver):  + { vehicleNumber, vehicleType, routeArea, upiId }
 * Body (advertiser): + { businessName, businessType, address }
 */
async function register(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }
    if (!['driver', 'advertiser'].includes(role)) {
      return res.status(400).json({ message: 'role must be "driver" or "advertiser"' });
    }

    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await conn.beginTransaction();

    const [userResult] = await conn.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, role]
    );
    const userId = userResult.insertId;

    if (role === 'driver') {
      const { vehicleNumber, vehicleType, routeArea, upiId } = req.body;
      if (!vehicleNumber || !vehicleType || !routeArea) {
        await conn.rollback();
        return res.status(400).json({
          message: 'vehicleNumber, vehicleType and routeArea are required for drivers',
        });
      }
      await conn.query(
        `INSERT INTO drivers (user_id, vehicle_number, vehicle_type, route_area, upi_id)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, vehicleNumber, vehicleType, routeArea, upiId || null]
      );
    } else {
      const { businessName, businessType, address } = req.body;
      if (!businessName || !businessType) {
        await conn.rollback();
        return res.status(400).json({
          message: 'businessName and businessType are required for advertisers',
        });
      }
      await conn.query(
        `INSERT INTO advertisers (user_id, business_name, business_type, address)
         VALUES (?, ?, ?, ?)`,
        [userId, businessName, businessType, address || null]
      );
    }

    await conn.commit();

    const token = generateToken({ id: userId, role });
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, name, email, role, phone: phone || null },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate a user and return a JWT
 * @access  Public
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id, role: user.role });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/auth/me
 * @desc    Get the logged-in user's profile (incl. driver/advertiser details)
 * @access  Private
 */
async function getMe(req, res, next) {
  try {
    const { id, role } = req.user;
    let profile = null;

    if (role === 'driver') {
      const [rows] = await pool.query('SELECT * FROM drivers WHERE user_id = ?', [id]);
      profile = rows[0] || null;
    } else if (role === 'advertiser') {
      const [rows] = await pool.query('SELECT * FROM advertisers WHERE user_id = ?', [id]);
      profile = rows[0] || null;
    }

    res.json({ user: req.user, profile });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
