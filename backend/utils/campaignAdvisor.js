// =====================================================================
// AdVia — AI Campaign Advisor
// ---------------------------------------------------------------------
// A free, fully local, RULE-BASED recommendation engine (no paid APIs,
// no external calls). Given a business type, optional monthly budget,
// and a preferred area, it "consults" the advertiser and suggests:
//   - best vehicle type for their audience
//   - how many vehicles fits their budget
//   - recommended campaign duration
//   - recommended target-area strategy
//   - a short list of plain-English tips
//
// This mirrors a real ad-consultant's first call, but runs instantly
// and entirely on the server — perfect for a hackathon demo.
// =====================================================================

// Monthly rate per vehicle, in INR — used for cost & count estimates.
const RATE_CARD = {
  'Auto-rickshaw': 900,
  Taxi: 1200,
  Bike: 600,
  'Delivery Van': 1000,
  'Mix (Auto + Bike)': 750,
};

// Knowledge base: one entry per business type.
const BUSINESS_PROFILES = {
  Restaurant: {
    vehicleType: 'Mix (Auto + Bike)',
    area: 'Residential lanes & market streets near your outlet',
    duration: 1,
    baseCount: 12,
    tips: [
      'Run a short 1-month pilot first — food offers work best with fresh, frequently-updated creatives.',
      'Add a QR code linking to your menu or a "Show this ad for 10% off" offer to measure response.',
      'Bikes reach narrow residential lanes that autos can\'t — good for delivery-radius awareness.',
    ],
  },
  'Medical / Pharmacy': {
    vehicleType: 'Auto-rickshaw',
    area: 'Residential routes & routes near hospitals/clinics',
    duration: 3,
    baseCount: 10,
    tips: [
      'Healthcare ads benefit from longer campaigns (3 months+) — trust builds with repeated exposure.',
      'Keep messaging simple: clinic name, key services, and a phone number in large text.',
      'Target routes near residential societies and other clinics for high-relevance impressions.',
    ],
  },
  Hotel: {
    vehicleType: 'Taxi',
    area: 'Station Road, Bus Stand & highway entry routes',
    duration: 3,
    baseCount: 8,
    tips: [
      'Taxis covering the railway station / bus stand reach travelers exactly when they need a hotel.',
      'Use a QR code linking directly to your booking page or WhatsApp for instant inquiries.',
      'Highlight nearby landmarks in your ad — travelers respond to "near X" messaging.',
    ],
  },
  'Retail Shop': {
    vehicleType: 'Mix (Auto + Bike)',
    area: 'Main market road & nearby residential colonies',
    duration: 1,
    baseCount: 15,
    tips: [
      'Pair the campaign with an in-store offer so impressions convert to footfall you can measure.',
      'Refresh creatives every festival season — seasonal offers outperform generic branding.',
      'A city-wide mini-campaign (15+ vehicles) builds quick brand recall for new shops.',
    ],
  },
  'Gym / Salon': {
    vehicleType: 'Bike',
    area: 'Residential colonies & college/office routes',
    duration: 1,
    baseCount: 10,
    tips: [
      'Bikes are cost-effective and reach younger, fitness-focused audiences on daily commutes.',
      'A "first month free" or "bring a friend" QR offer converts well for gyms & salons.',
      'Target routes near colleges and IT offices for the 18–35 demographic.',
    ],
  },
  'School / Tuition': {
    vehicleType: 'Auto-rickshaw',
    area: 'School pickup/drop routes & residential societies',
    duration: 3,
    baseCount: 10,
    tips: [
      'Parents notice ads on autos used for school pickup/drop — high relevance, low waste.',
      'Run campaigns ahead of admission season (Feb–June) for maximum impact.',
      'Include admission deadlines or a contact number prominently.',
    ],
  },
  'Startup / Brand': {
    vehicleType: 'Mix (Auto + Bike)',
    area: 'City-wide, prioritizing high-traffic commercial routes',
    duration: 1,
    baseCount: 25,
    tips: [
      'Start with a 1-month city-wide pilot to test messaging before committing to a long campaign.',
      'Use a memorable QR code or short link — track scans to measure real engagement.',
      'Combine with social media: photograph the vehicles and re-share for extra organic reach.',
    ],
  },
  Other: {
    vehicleType: 'Auto-rickshaw',
    area: 'City-wide, focused on your primary customer area',
    duration: 1,
    baseCount: 10,
    tips: [
      'Auto-rickshaws offer the best cost-to-reach ratio for most local businesses.',
      'Start with a 1-month campaign and use the AdVia analytics dashboard to decide whether to extend.',
      'A simple, bold message with your phone number performs better than a busy design.',
    ],
  },
};

/**
 * Generate a campaign recommendation.
 * @param {object} input
 * @param {string} input.businessType - one of the keys in BUSINESS_PROFILES
 * @param {number} [input.budget] - advertiser's monthly budget in INR (optional)
 * @param {string} [input.preferredArea] - advertiser's own area text (optional)
 * @returns {object} recommendation
 */
function getCampaignRecommendation({ businessType, budget, preferredArea }) {
  const profile = BUSINESS_PROFILES[businessType] || BUSINESS_PROFILES.Other;
  const rate = RATE_CARD[profile.vehicleType];

  let recommendedCount = profile.baseCount;
  const reasoning = [];

  reasoning.push(
    `For "${businessType}", AdVia recommends ${profile.vehicleType} vehicles — ${profile.area.toLowerCase()}.`
  );

  if (budget && Number(budget) > 0) {
    const affordableCount = Math.floor(Number(budget) / (rate * profile.duration));
    if (affordableCount < 1) {
      recommendedCount = 1;
      reasoning.push(
        `Your budget of ₹${Number(budget).toLocaleString('en-IN')} is below the cost of one vehicle for ${profile.duration} month(s) — starting with 1 vehicle as a trial.`
      );
    } else {
      recommendedCount = Math.min(affordableCount, profile.baseCount * 3);
      reasoning.push(
        `Based on your budget of ₹${Number(budget).toLocaleString('en-IN')}, you can cover ${recommendedCount} vehicle(s) for ${profile.duration} month(s) at ₹${rate}/vehicle/month.`
      );
    }
  } else {
    reasoning.push(
      `No budget given — suggesting a typical starter count of ${recommendedCount} vehicles for this business type.`
    );
  }

  const estimatedCost = recommendedCount * rate * profile.duration;

  return {
    recommendedVehicleType: profile.vehicleType,
    recommendedVehicleCount: recommendedCount,
    recommendedDuration: profile.duration,
    recommendedArea: preferredArea && preferredArea.trim() ? preferredArea.trim() : profile.area,
    perVehicleMonthlyRate: rate,
    estimatedCost,
    reasoning,
    tips: profile.tips,
  };
}

module.exports = { getCampaignRecommendation, RATE_CARD, BUSINESS_PROFILES };
