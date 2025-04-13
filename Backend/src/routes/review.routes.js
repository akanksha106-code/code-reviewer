const express = require('express');
const { saveReview, getUserReviews, getReviewById, deleteReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// @route   POST /api/reviews
router.post('/', saveReview);

// @route   GET /api/reviews
router.get('/', getUserReviews);

// @route   GET /api/reviews/:id
router.get('/:id', getReviewById);

// @route   DELETE /api/reviews/:id
router.delete('/:id', deleteReview);

module.exports = router; 