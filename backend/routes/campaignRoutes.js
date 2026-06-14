// =====================================================================
// AdVia Backend — Campaign Routes
//   POST /api/campaigns
//   GET  /api/campaigns
//   GET  /api/campaigns/:id
//   PUT  /api/campaigns/:id/activate
//   PUT  /api/campaigns/:id/cancel
// =====================================================================
const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, requireRole } = require('../middleware/auth');
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  activateCampaign,
  cancelCampaign,
} = require('../controllers/campaignController');

const router = express.Router();

// Every route below requires a logged-in advertiser.
router.use(protect, requireRole('advertiser'));

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('title is required'),
    body('targetArea').trim().notEmpty().withMessage('targetArea is required'),
    body('vehicleType').notEmpty().withMessage('vehicleType is required'),
    body('vehicleCount').isInt({ min: 1 }).withMessage('vehicleCount must be a positive integer'),
    body('durationMonths').isInt({ min: 1 }).withMessage('durationMonths must be a positive integer'),
  ],
  validate,
  createCampaign
);

router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.put('/:id/activate', activateCampaign);
router.put('/:id/cancel', cancelCampaign);

module.exports = router;
