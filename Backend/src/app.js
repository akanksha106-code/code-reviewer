require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});
const validateEnv = require('./config/env.validation');
validateEnv();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database'); // Updated path
const aiRoutes = require('./routes/ai.routes');
const authRoutes = require('./routes/auth.routes');
const reviewRoutes = require('./routes/review.routes');

// Connect to MongoDB
connectDB();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Middleware
app.use(express.json());

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running');
});

// Test route for Postman
app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint is working' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;