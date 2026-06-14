// =====================================================================
// AdVia Backend — Analytics Helpers
// ---------------------------------------------------------------------
// AdVia doesn't (yet) have real GPS/QR-scan hardware integrated, so we
// derive a believable, DETERMINISTIC "impressions" estimate from the
// number of vehicles actively carrying an ad and how many days the
// campaign has been running. This keeps the dashboard meaningful for a
// demo while being clearly explainable to judges.
//
//   impressions ≈ accepted_vehicles × DAILY_IMPRESSIONS_PER_VEHICLE × days_active
//
// Swapping this for real telemetry later only requires replacing
// `estimateImpressions` — every controller calls through this module.
// =====================================================================

const DAILY_IMPRESSIONS_PER_VEHICLE = 1500; // avg. people who see one vehicle's ad per day
const QR_SCAN_RATE = 0.02; // ~2% of impressions result in a QR scan (industry-typical estimate)

/** Number of whole days between two dates (min 0). `end` defaults to today. */
function daysBetween(start, end = new Date()) {
  if (!start) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}

/**
 * Estimate total impressions for a campaign so far.
 * @param {object} campaign - row from `campaigns`
 * @param {number} acceptedVehicles - count of jobs with status='accepted'/'completed'
 */
function estimateImpressions(campaign, acceptedVehicles) {
  if (!campaign.start_date || acceptedVehicles <= 0) return 0;

  const cappedEnd = campaign.end_date && new Date(campaign.end_date) < new Date()
    ? campaign.end_date
    : new Date();

  const days = daysBetween(campaign.start_date, cappedEnd);
  return acceptedVehicles * DAILY_IMPRESSIONS_PER_VEHICLE * days;
}

/** Estimate QR scans from an impressions count. */
function estimateQrScans(impressions) {
  return Math.round(impressions * QR_SCAN_RATE);
}

module.exports = { estimateImpressions, estimateQrScans, daysBetween, DAILY_IMPRESSIONS_PER_VEHICLE };
