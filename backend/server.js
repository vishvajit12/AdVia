// =====================================================================
// AdVia Backend — Server Entry Point
// =====================================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { testConnection } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const driverRoutes = require('./routes/driverRoutes');
const advertiserRoutes = require('./routes/advertiserRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// ---------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AdVia API', time: new Date().toISOString() });
});

// ---------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/advertisers', advertiserRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// ---------------------------------------------------------------------
// 404 + error handlers (must be last)
// ---------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// ---------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚐 AdVia API running on http://localhost:${PORT}`);
  await testConnection();
});

module.exports = app;
