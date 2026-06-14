// =====================================================================
// AdVia — Job Matcher
// ---------------------------------------------------------------------
// When an advertiser activates a campaign, this finds eligible drivers
// (matching vehicle type + route area), creates "job offer" rows in
// the `jobs` table, and pushes a notification to each matched driver.
//
// Matching rules (kept simple & explainable for a demo):
//   1. Vehicle type must match (campaign "Mix (Auto + Bike)" matches
//      both Auto-rickshaw and Bike drivers).
//   2. Driver must be verified (is_verified = 1).
//   3. Route area matches if campaign target is "City-wide" OR the
//      driver's route_area shares a keyword with the target area.
//   4. Limited to campaign.vehicle_count drivers.
// =====================================================================
const { RATE_CARD } = require('./campaignAdvisor');

/**
 * @param {import('mysql2/promise').PoolConnection} conn - active connection (so it can share a transaction)
 * @param {object} campaign - row from `campaigns` table
 * @returns {Promise<number>} number of jobs created
 */
async function matchDriversToCampaign(conn, campaign) {
  const { id: campaignId, target_area, vehicle_type, vehicle_count } = campaign;

  // Build the list of vehicle types that satisfy this campaign.
  const acceptedTypes =
    vehicle_type === 'Mix (Auto + Bike)'
      ? ['Auto-rickshaw', 'Bike']
      : [vehicle_type];

  const placeholders = acceptedTypes.map(() => '?').join(', ');
  const [drivers] = await conn.query(
    `SELECT id, user_id, route_area, vehicle_type
       FROM drivers
      WHERE is_verified = 1
        AND vehicle_type IN (${placeholders})`,
    acceptedTypes
  );

  const targetWords = String(target_area || '')
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((w) => w.length > 2);

  const isCityWide = String(target_area || '').toLowerCase().includes('city-wide');

  const matched = drivers.filter((d) => {
    if (isCityWide) return true;
    const driverWords = String(d.route_area || '').toLowerCase();
    return targetWords.some((w) => driverWords.includes(w));
  });

  const selected = matched.slice(0, vehicle_count);
  const monthlyPay = RATE_CARD[vehicle_type] || RATE_CARD['Auto-rickshaw'];

  let created = 0;
  for (const driver of selected) {
    try {
      await conn.query(
        `INSERT INTO jobs (campaign_id, driver_id, status, monthly_pay)
         VALUES (?, ?, 'offered', ?)`,
        [campaignId, driver.id, monthlyPay]
      );
      await conn.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, ?, ?, 'job')`,
        [
          driver.user_id,
          'New ad job available!',
          `A new campaign near "${target_area}" is looking for ${vehicle_type} vehicles — ₹${monthlyPay}/month. Check Job Offers to accept.`,
        ]
      );
      created += 1;
    } catch (err) {
      // Skip duplicates (driver already has a job for this campaign) silently.
      if (err.code !== 'ER_DUP_ENTRY') throw err;
    }
  }

  return created;
}

module.exports = { matchDriversToCampaign };
