/**
 * Backend API Server
 * Runs on port 8000
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.BACKEND_PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI2AIM RX Backend API',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'AI2AIM RX Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      ai: '/api/ai',
      automations: '/api/automations',
      medical: '/api/medical',
    },
  });
});

// AI Agents API
app.use('/api/ai', require('./routes/ai'));

// Automations API
app.use('/api/automations', require('./routes/automations'));

// Medical Data API
app.use('/api/medical', require('./routes/medical'));

// Robot API
app.use('/api/robot', require('./routes/robot'));

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend API Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
});

module.exports = app;
