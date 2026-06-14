// =====================================================================
// AdVia Backend — Advertiser Controller
// Endpoints used by the Advertiser Dashboard: overview, analytics
// (impressions/QR scans/area breakdown), and billing/invoices.
// =====================================================================
const { pool } = require('../config/db');
const { estimateImpressions, estimateQrScans, daysBetween } = require('../utils/analytics');

/** Helper: get the `advertisers` row id for the logged-in user. */
async function getAdvertiserId(userId) {
  const [rows] = await pool.query('SELECT id FROM advertisers WHERE user_id = ?', [userId]);
  if (rows.length === 0) throw Object.assign(new Error('Advertiser profile not found'), { statusCode: 404 });
  return rows[0].id;
}

/**
 * @route   GET /api/advertisers/profile
 * @desc    Get the advertiser's business profile
 * @access  Private (advertiser)
 */
async function getProfile(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, u.name, u.email, u.phone
         FROM advertisers a
         JOIN users u ON u.id = a.user_id
        WHERE a.user_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Advertiser profile not found' });
    res.json({ profile: rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/advertisers/dashboard
 * @desc    Overview stats + the most recent active campaign for the home screen
 * @access  Private (advertiser)
 */
async function getDashboard(req, res, next) {
  try {
    const advertiserId = await getAdvertiserId(req.user.id);

    const [campaigns] = await pool.query(
      `SELECT * FROM campaigns WHERE advertiser_id = ?`,
      [advertiserId]
    );

    const [[{ totalSpend }]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS totalSpend FROM invoices WHERE advertiser_id = ?`,
      [advertiserId]
    );

    let totalVehicles = 0;
    let impressionsThisMonth = 0;
    let activeCampaign = null;

    for (const c of campaigns) {
      const [[{ cnt }]] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM jobs WHERE campaign_id = ? AND status IN ('accepted','completed')`,
        [c.id]
      );
      if (c.status === 'active') {
        totalVehicles += cnt;
        const impressions = estimateImpressions(c, cnt);
        impressionsThisMonth += impressions;

        if (!activeCampaign) {
          const elapsedDays = daysBetween(c.start_date);
          const totalDays = Math.max(c.duration_months * 30, 1);
          activeCampaign = {
            ...c,
            acceptedVehicles: cnt,
            impressions,
            progressPct: Math.min(Math.round((elapsedDays / totalDays) * 100), 100),
          };
        }
      }
    }

    res.json({
      stats: {
        activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
        totalVehicles,
        impressionsThisMonth,
        totalSpend: Number(totalSpend),
      },
      activeCampaign,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/advertisers/analytics
 * @desc    Aggregate impressions, QR scans, average daily reach, and a
 *          breakdown of impressions by target area.
 * @access  Private (advertiser)
 */
async function getAnalytics(req, res, next) {
  try {
    const advertiserId = await getAdvertiserId(req.user.id);
    const [campaigns] = await pool.query(
      `SELECT * FROM campaigns WHERE advertiser_id = ? AND status IN ('active','completed')`,
      [advertiserId]
    );

    let totalImpressions = 0;
    let totalDays = 0;
    const areaMap = {};

    for (const c of campaigns) {
      const [[{ cnt }]] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM jobs WHERE campaign_id = ? AND status IN ('accepted','completed')`,
        [c.id]
      );
      const impressions = estimateImpressions(c, cnt);
      totalImpressions += impressions;
      totalDays += daysBetween(c.start_date, c.end_date && new Date(c.end_date) < new Date() ? c.end_date : new Date());

      areaMap[c.target_area] = (areaMap[c.target_area] || 0) + impressions;
    }

    const impressionsByArea = Object.entries(areaMap)
      .map(([area, impressions]) => ({
        area,
        impressions,
        pct: totalImpressions > 0 ? Math.round((impressions / totalImpressions) * 100) : 0,
      }))
      .sort((a, b) => b.impressions - a.impressions);

    res.json({
      totalImpressions,
      qrScans: estimateQrScans(totalImpressions),
      avgDailyReach: totalDays > 0 ? Math.round(totalImpressions / totalDays) : 0,
      impressionsByArea,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/advertisers/billing
 * @desc    List all invoices for the advertiser
 * @access  Private (advertiser)
 */
async function getBilling(req, res, next) {
  try {
    const advertiserId = await getAdvertiserId(req.user.id);
    const [invoices] = await pool.query(
      `SELECT i.*, c.title AS campaignTitle
         FROM invoices i
         JOIN campaigns c ON c.id = i.campaign_id
        WHERE i.advertiser_id = ?
        ORDER BY i.issued_at DESC`,
      [advertiserId]
    );
    res.json({ invoices });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, getDashboard, getAnalytics, getBilling };
