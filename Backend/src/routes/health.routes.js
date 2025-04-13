const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Basic health check endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Check database connection
router.get('/db', async (req, res) => {
  try {
    // Check if connected to MongoDB
    const dbStatus = mongoose.connection.readyState;
    const statuses = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({
      status: statuses[dbStatus] || 'unknown',
      connected: dbStatus === 1,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Database health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Check service integration health
router.get('/services', (req, res) => {
  const aiServiceStatus = process.env.GOOGLE_GEMINI_KEY || process.env.GOOGLE_API_KEY
    ? 'configured'
    : 'not configured';
    
  res.json({
    services: {
      ai: aiServiceStatus,
    },
    timestamp: new Date().toISOString()
  });
});

// Check available
router.get('/check', (req, res) => {
  res.json({ available: true });
});

module.exports = router;
