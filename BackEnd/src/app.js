const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const aiRoutes = require('./routes/ai.routes');
const authRoutes = require('./routes/auth.routes');
const reviewRoutes = require('./routes/review.routes');

// Connect to MongoDB
connectDB();

const app = express();

// CORS configuration using environment variables
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://frontend:5173').split(',');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running');
});

// Test route for Postman
app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint is working' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// API routes
app.use('/api/ai', aiRoutes);
app.use('/api/reviews', reviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;