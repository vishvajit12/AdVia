// =====================================================================
// AdVia Backend — Campaign Controller
// Endpoints used by the Advertiser Dashboard's "New Campaign" wizard
// and "My Campaigns" list.
// =====================================================================
const { pool } = require('../config/db');
const { RATE_CARD } = require('../utils/campaignAdvisor');
const { matchDriversToCampaign } = require('../utils/jobMatcher');
const { estimateImpressions, estimateQrScans } = require('../utils/analytics');

const VALID_VEHICLE_TYPES = Object.keys(RATE_CARD);

/** Helper: get the `advertisers` row id for the logged-in user. */
async function getAdvertiserId(userId) {
  const [rows] = await pool.query('SELECT id FROM advertisers WHERE user_id = ?', [userId]);
  if (rows.length === 0) throw Object.assign(new Error('Advertiser profile not found'), { statusCode: 404 });
  return rows[0].id;
}

/** Helper: count accepted/completed jobs for a campaign. */
async function getAcceptedVehicleCount(campaignId) {
  const [[{ cnt }]] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM jobs WHERE campaign_id = ? AND status IN ('accepted', 'completed')`,
    [campaignId]
  );
  return cnt;
}

/**
 * @route   POST /api/campaigns
 * @desc    Create a new campaign. If `activate` is true, immediately goes
 *          live: matches drivers, creates job offers + notifications,
 *          and generates an invoice.
 * @access  Private (advertiser)
 * Body: { title, targetArea, vehicleType, vehicleCount, durationMonths, activate? }
 */
async function createCampaign(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const advertiserId = await getAdvertiserId(req.user.id);
    const { title, targetArea, vehicleType, vehicleCount, durationMonths, activate } = req.body;

    if (!title || !targetArea || !vehicleType || !vehicleCount || !durationMonths) {
      return res.status(400).json({
        message: 'title, targetArea, vehicleType, vehicleCount and durationMonths are required',
      });
    }
    if (!VALID_VEHICLE_TYPES.includes(vehicleType)) {
      return res.status(400).json({ message: `vehicleType must be one of: ${VALID_VEHICLE_TYPES.join(', ')}` });
    }
    if (Number(vehicleCount) < 1 || Number(durationMonths) < 1) {
      return res.status(400).json({ message: 'vehicleCount and durationMonths must be at least 1' });
    }

    const estimatedCost = RATE_CARD[vehicleType] * Number(vehicleCount) * Number(durationMonths);

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO campaigns (advertiser_id, title, target_area, vehicle_type, vehicle_count, duration_months, status, estimated_cost)
       VALUES (?, ?, ?, ?, ?, ?, 'draft', ?)`,
      [advertiserId, title, targetArea, vehicleType, vehicleCount, durationMonths, estimatedCost]
    );
    const campaignId = result.insertId;

    let jobsCreated = 0;
    if (activate) {
      await conn.query(
        `UPDATE campaigns
            SET status = 'active', start_date = CURDATE(), end_date = DATE_ADD(CURDATE(), INTERVAL ? MONTH)
          WHERE id = ?`,
        [durationMonths, campaignId]
      );

      const [[campaign]] = await conn.query('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
      jobsCreated = await matchDriversToCampaign(conn, campaign);

      await conn.query(
        `INSERT INTO invoices (campaign_id, advertiser_id, amount, status) VALUES (?, ?, ?, 'pending')`,
        [campaignId, advertiserId, estimatedCost]
      );
    }

    await conn.commit();

    const [[campaign]] = await pool.query('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
    res.status(201).json({
      message: activate ? `Campaign launched — ${jobsCreated} vehicle(s) notified` : 'Campaign saved as draft',
      campaign,
      jobsCreated,
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * @route   GET /api/campaigns
 * @desc    List all campaigns for the logged-in advertiser, with
 *          live-computed vehicle/impression stats.
 * @access  Private (advertiser)
 */
async function getCampaigns(req, res, next) {
  try {
    const advertiserId = await getAdvertiserId(req.user.id);
    const [campaigns] = await pool.query(
      `SELECT * FROM campaigns WHERE advertiser_id = ? ORDER BY created_at DESC`,
      [advertiserId]
    );

    const enriched = await Promise.all(
      campaigns.map(async (c) => {
        const acceptedVehicles = await getAcceptedVehicleCount(c.id);
        const impressions = estimateImpressions(c, acceptedVehicles);
        return { ...c, acceptedVehicles, impressions };
      })
    );

    res.json({ campaigns: enriched });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/campaigns/:id
 * @desc    Get full detail for a single campaign, including matched jobs.
 * @access  Private (advertiser)
 */
async function getCampaignById(req, res, next) {
  try {
    const advertiserId = await getAdvertiserId(req.user.id);
    const { id } = req.params;

    const [[campaign]] = await pool.query(
      'SELECT * FROM campaigns WHERE id = ? AND advertiser_id = ?',
      [id, advertiserId]
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    const [jobs] = await pool.query(
      `SELECT j.id, j.status, j.monthly_pay, j.offered_at, j.responded_at,
              d.vehicle_number, d.vehicle_type, d.route_area, d.rating
         FROM jobs j
         JOIN drivers d ON d.id = j.driver_id
        WHERE j.campaign_id = ?`,
      [id]
    );

    const acceptedVehicles = jobs.filter((j) => ['accepted', 'completed'].includes(j.status)).length;
    const impressions = estimateImpressions(campaign, acceptedVehicles);

    res.json({
      campaign: { ...campaign, acceptedVehicles, impressions, qrScans: estimateQrScans(impressions) },
      jobs,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   PUT /api/campaigns/:id/activate
 * @desc    Activate a draft campaign — matches drivers & creates an invoice.
 * @access  Private (advertiser)
 */
async function activateCampaign(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const advertiserId = await getAdvertiserId(req.user.id);
    const { id } = req.params;

    const [[campaign]] = await conn.query(
      'SELECT * FROM campaigns WHERE id = ? AND advertiser_id = ?',
      [id, advertiserId]
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (campaign.status !== 'draft') {
      return res.status(400).json({ message: `Campaign is already ${campaign.status}` });
    }

    await conn.beginTransaction();

    await conn.query(
      `UPDATE campaigns
          SET status = 'active', start_date = CURDATE(), end_date = DATE_ADD(CURDATE(), INTERVAL ? MONTH)
        WHERE id = ?`,
      [campaign.duration_months, id]
    );

    const [[updated]] = await conn.query('SELECT * FROM campaigns WHERE id = ?', [id]);
    const jobsCreated = await matchDriversToCampaign(conn, updated);

    await conn.query(
      `INSERT INTO invoices (campaign_id, advertiser_id, amount, status) VALUES (?, ?, ?, 'pending')`,
      [id, advertiserId, campaign.estimated_cost]
    );

    await conn.commit();
    res.json({ message: `Campaign activated — ${jobsCreated} vehicle(s) notified`, jobsCreated, campaign: updated });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * @route   PUT /api/campaigns/:id/cancel
 * @desc    Cancel a campaign (draft or active).
 * @access  Private (advertiser)
 */
async function cancelCampaign(req, res, next) {
  try {
    const advertiserId = await getAdvertiserId(req.user.id);
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE campaigns SET status = 'cancelled' WHERE id = ? AND advertiser_id = ? AND status != 'completed'`,
      [id, advertiserId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Campaign not found or cannot be cancelled' });
    }

    res.json({ message: 'Campaign cancelled' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createCampaign, getCampaigns, getCampaignById, activateCampaign, cancelCampaign };
