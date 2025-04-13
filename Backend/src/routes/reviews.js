const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createReview } = require('../controllers/review.controller');
const Review = require('../models/Review');
const mongoose = require('mongoose');

// Protect all routes
router.use(auth);

// Debug middleware
router.use((req, res, next) => {
  console.log('Reviews route accessed with user:', req.user);
  next();
});

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    
    return res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new review - use dedicated controller
router.post('/', createReview);

module.exports = router;