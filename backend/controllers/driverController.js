// =====================================================================
// AdVia Backend — Driver Controller
// Endpoints used by the Driver Dashboard:
//   - dashboard summary (stats + active campaigns)
//   - job offers (list / accept / decline)
//   - earnings (monthly chart data + payment history)
//   - vehicle profile (view / update)
// =====================================================================
const { pool } = require('../config/db');

/** Helper: get the `drivers` row id for the logged-in user. */
async function getDriverId(userId) {
  const [rows] = await pool.query('SELECT id FROM drivers WHERE user_id = ?', [userId]);
  if (rows.length === 0) throw Object.assign(new Error('Driver profile not found'), { statusCode: 404 });
  return rows[0].id;
}

/**
 * @route   GET /api/drivers/dashboard
 * @desc    Summary stats + active campaigns for the driver home screen
 * @access  Private (driver)
 */
async function getDashboard(req, res, next) {
  try {
    const driverId = await getDriverId(req.user.id);

    const [[{ totalEarned }]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS totalEarned
         FROM payments WHERE driver_id = ? AND status = 'paid'`,
      [driverId]
    );

    const [[{ thisMonthEarnings }]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS thisMonthEarnings
         FROM payments
        WHERE driver_id = ?
          AND MONTH(created_at) = MONTH(CURDATE())
          AND YEAR(created_at) = YEAR(CURDATE())`,
      [driverId]
    );

    const [[{ pendingOffers }]] = await pool.query(
      `SELECT COUNT(*) AS pendingOffers FROM jobs WHERE driver_id = ? AND status = 'offered'`,
      [driverId]
    );

    const [activeJobs] = await pool.query(
      `SELECT j.id AS jobId, j.monthly_pay, j.status,
              c.title AS campaignTitle, c.start_date, c.end_date, c.duration_months,
              a.business_name
         FROM jobs j
         JOIN campaigns c ON c.id = j.campaign_id
         JOIN advertisers a ON a.id = c.advertiser_id
        WHERE j.driver_id = ? AND j.status IN ('accepted', 'completed')
        ORDER BY j.offered_at DESC`,
      [driverId]
    );

    res.json({
      stats: {
        totalEarned: Number(totalEarned),
        thisMonthEarnings: Number(thisMonthEarnings),
        activeCampaigns: activeJobs.filter((j) => j.status === 'accepted').length,
        pendingOffers: Number(pendingOffers),
      },
      activeJobs,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/drivers/jobs
 * @desc    List all job offers/jobs for the logged-in driver
 * @access  Private (driver)
 */
async function getJobs(req, res, next) {
  try {
    const driverId = await getDriverId(req.user.id);

    const [jobs] = await pool.query(
      `SELECT j.id, j.status, j.monthly_pay, j.offered_at, j.responded_at,
              c.id AS campaignId, c.title, c.target_area, c.vehicle_type, c.duration_months,
              a.business_name
         FROM jobs j
         JOIN campaigns c ON c.id = j.campaign_id
         JOIN advertisers a ON a.id = c.advertiser_id
        WHERE j.driver_id = ?
        ORDER BY j.offered_at DESC`,
      [driverId]
    );

    res.json({ jobs });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   PUT /api/drivers/jobs/:jobId
 * @desc    Accept or decline a job offer
 * @access  Private (driver)
 * Body: { action: 'accept' | 'decline' }
 */
async function respondToJob(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const driverId = await getDriverId(req.user.id);
    const { jobId } = req.params;
    const { action } = req.body;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'action must be "accept" or "decline"' });
    }

    const [rows] = await conn.query('SELECT * FROM jobs WHERE id = ? AND driver_id = ?', [jobId, driverId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Job offer not found' });
    }
    const job = rows[0];
    if (job.status !== 'offered') {
      return res.status(400).json({ message: `Job already ${job.status}` });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    await conn.beginTransaction();

    await conn.query('UPDATE jobs SET status = ?, responded_at = NOW() WHERE id = ?', [newStatus, jobId]);

    if (action === 'accept') {
      await conn.query(
        `INSERT INTO payments (job_id, driver_id, amount, status) VALUES (?, ?, ?, 'pending')`,
        [jobId, driverId, job.monthly_pay]
      );
    }

    await conn.commit();
    res.json({ message: `Job ${newStatus}`, jobId: Number(jobId), status: newStatus });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * @route   GET /api/drivers/earnings
 * @desc    Monthly earnings chart data + full payment history
 * @access  Private (driver)
 */
async function getEarnings(req, res, next) {
  try {
    const driverId = await getDriverId(req.user.id);

    const [monthly] = await pool.query(
      `SELECT MONTH(created_at) AS month, SUM(amount) AS total
         FROM payments
        WHERE driver_id = ? AND YEAR(created_at) = YEAR(CURDATE())
        GROUP BY MONTH(created_at)
        ORDER BY month`,
      [driverId]
    );

    const [history] = await pool.query(
      `SELECT p.id, p.amount, p.status, p.paid_at, p.created_at,
              c.title AS campaignTitle, a.business_name
         FROM payments p
         JOIN jobs j ON j.id = p.job_id
         JOIN campaigns c ON c.id = j.campaign_id
         JOIN advertisers a ON a.id = c.advertiser_id
        WHERE p.driver_id = ?
        ORDER BY p.created_at DESC`,
      [driverId]
    );

    res.json({ monthly, history });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/drivers/profile
 * @desc    Get the driver's vehicle profile
 * @access  Private (driver)
 */
async function getProfile(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, u.name, u.email, u.phone
         FROM drivers d
         JOIN users u ON u.id = d.user_id
        WHERE d.user_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Driver profile not found' });
    res.json({ profile: rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   PUT /api/drivers/profile
 * @desc    Update editable vehicle profile fields
 * @access  Private (driver)
 * Body: { routeArea?, upiId?, vehicleType? }
 */
async function updateProfile(req, res, next) {
  try {
    const { routeArea, upiId, vehicleType } = req.body;
    const fields = [];
    const values = [];

    if (routeArea) { fields.push('route_area = ?'); values.push(routeArea); }
    if (upiId) { fields.push('upi_id = ?'); values.push(upiId); }
    if (vehicleType) { fields.push('vehicle_type = ?'); values.push(vehicleType); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    values.push(req.user.id);
    await pool.query(`UPDATE drivers SET ${fields.join(', ')} WHERE user_id = ?`, values);

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, getJobs, respondToJob, getEarnings, getProfile, updateProfile };
