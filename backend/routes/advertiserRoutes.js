// =====================================================================
// AdVia Backend — Advertiser Routes
//   GET /api/advertisers/profile
//   GET /api/advertisers/dashboard
//   GET /api/advertisers/analytics
//   GET /api/advertisers/billing
// =====================================================================
const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const { getProfile, getDashboard, getAnalytics, getBilling } = require('../controllers/advertiserController');

const router = express.Router();

// Every route below requires a logged-in advertiser.
router.use(protect, requireRole('advertiser'));

router.get('/profile', getProfile);
router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/billing', getBilling);

module.exports = router;
