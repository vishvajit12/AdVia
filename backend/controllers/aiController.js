// =====================================================================
// AdVia Backend — AI Advisor Controller
// Thin HTTP wrapper around utils/campaignAdvisor.js — a free, local,
// rule-based "AI consultation" for advertisers planning a campaign.
// =====================================================================
const { getCampaignRecommendation, BUSINESS_PROFILES } = require('../utils/campaignAdvisor');

/**
 * @route   GET /api/ai/business-types
 * @desc    List the business types the advisor knows about (for the
 *          dropdown in the New Campaign wizard)
 * @access  Public
 */
function getBusinessTypes(req, res) {
  res.json({ businessTypes: Object.keys(BUSINESS_PROFILES) });
}

/**
 * @route   POST /api/ai/advisor
 * @desc    Get an AI-generated campaign recommendation
 * @access  Private (advertiser)
 * Body: { businessType, budget?, preferredArea? }
 */
function getAdvice(req, res, next) {
  try {
    const { businessType, budget, preferredArea } = req.body;
    if (!businessType) {
      return res.status(400).json({ message: 'businessType is required' });
    }

    const recommendation = getCampaignRecommendation({ businessType, budget, preferredArea });
    res.json({ recommendation });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBusinessTypes, getAdvice };
