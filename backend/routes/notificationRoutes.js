// =====================================================================
// AdVia Backend — Notification Routes
//   GET /api/notifications
//   PUT /api/notifications/:id/read
//   PUT /api/notifications/read-all
// =====================================================================
const express = require('express');
const { protect } = require('../middleware/auth');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

const router = express.Router();

router.use(protect); // any logged-in user (driver or advertiser)

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

module.exports = router;
