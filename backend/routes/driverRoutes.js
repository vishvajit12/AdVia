// =====================================================================
// AdVia Backend — Driver Routes
//   GET /api/drivers/dashboard
//   GET /api/drivers/jobs
//   PUT /api/drivers/jobs/:jobId
//   GET /api/drivers/earnings
//   GET /api/drivers/profile
//   PUT /api/drivers/profile
// =====================================================================
const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, requireRole } = require('../middleware/auth');
const {
  getDashboard,
  getJobs,
  respondToJob,
  getEarnings,
  getProfile,
  updateProfile,
} = require('../controllers/driverController');

const router = express.Router();

// Every route below requires a logged-in driver.
router.use(protect, requireRole('driver'));

router.get('/dashboard', getDashboard);
router.get('/jobs', getJobs);
router.put(
  '/jobs/:jobId',
  [body('action').isIn(['accept', 'decline']).withMessage('action must be accept or decline')],
  validate,
  respondToJob
);
router.get('/earnings', getEarnings);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
