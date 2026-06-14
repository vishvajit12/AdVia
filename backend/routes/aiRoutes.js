// =====================================================================
// AdVia Backend — AI Advisor Routes
//   GET  /api/ai/business-types
//   POST /api/ai/advisor
// =====================================================================
const express = require('express');
const { protect, requireRole } = require('../middleware/auth');
const { getBusinessTypes, getAdvice } = require('../controllers/aiController');

const router = express.Router();

// Business type list is public — useful to populate the registration form too.
router.get('/business-types', getBusinessTypes);

// Recommendation requires a logged-in advertiser.
router.post('/advisor', protect, requireRole('advertiser'), getAdvice);

module.exports = router;
