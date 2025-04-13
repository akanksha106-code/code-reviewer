const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        message: 'Database not connected',
        error: 'Database connection is not ready'
      });
    }

    const reviews = await Review.find({})
      .select('code review author createdAt updatedAt')
      .populate('author', 'username email')
      .lean()
      .exec();

    // If no reviews found, return empty array
    if (!Array.isArray(reviews)) {
      return res.status(200).json([]);
    }

    // Filter out any invalid records
    const validReviews = reviews.filter(review => 
      review &&
      typeof review === 'object' &&
      mongoose.Types.ObjectId.isValid(review._id) &&
      review.code &&
      review.review &&
      review.author
    );

    return res.status(200).json(validReviews);

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message || 'Unknown error occurred'
    });
  }
});

module.exports = router;