// =====================================================================
// AdVia Backend — Notification Controller
// Shared between drivers and advertisers — every user has their own
// notification feed in the `notifications` table.
// =====================================================================
const { pool } = require('../config/db');

/**
 * @route   GET /api/notifications
 * @desc    Get the logged-in user's notifications (most recent first)
 * @access  Private
 */
async function getNotifications(req, res, next) {
  try {
    const [notifications] = await pool.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    const [[{ unread }]] = await pool.query(
      `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0`,
      [req.user.id]
    );
    res.json({ notifications, unread });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Private
 */
async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Marked as read' });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all of the logged-in user's notifications as read
 * @access  Private
 */
async function markAllAsRead(req, res, next) {
  try {
    await pool.query(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [req.user.id]);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead };
