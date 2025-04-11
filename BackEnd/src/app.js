const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const aiRoutes = require('./routes/ai.routes');
const authRoutes = require('./routes/auth.routes');
const reviewRoutes = require('./routes/review.routes');

// Connect to MongoDB
connectDB();

const app = express();

// More specific CORS configuration
const corsOptions = {
  origin: ['http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179', 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
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