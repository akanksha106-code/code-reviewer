const express = require('express');
const router = express.Router();
const { validateReviewData } = require('../middleware/validation');
const Review = require('../models/Review');

// Get all reviews for the authenticated user
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific review by ID
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new review
router.post('/', validateReviewData, async (req, res) => {
  try {
    const { code, review: reviewText, language } = req.body;
    
    const newReview = new Review({
      user: req.user.id,
      code,
      review: reviewText,
      language
    });
    
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a review
router.put('/:id', validateReviewData, async (req, res) => {
  try {
    const { code, review: reviewText, language } = req.body;
    
    // Check if review exists and belongs to user
    let review = await Review.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Update fields
    review.code = code;
    review.review = reviewText;
    review.language = language;
    
    const updatedReview = await review.save();
    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a review
router.delete('/:id', async (req, res) => {
  try {
    const result = await Review.deleteOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;