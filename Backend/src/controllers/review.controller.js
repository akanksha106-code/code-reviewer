const Review = require('../models/Review');
const mongoose = require('mongoose');

/**
 * Create a review with extensive error handling and debugging
 */
const createReview = async (req, res) => {
  console.log('=== REVIEW CREATION STARTED ===');
  console.log('Request user:', req.user);
  console.log('Request body:', {
    codePresent: !!req.body.code,
    reviewPresent: !!req.body.review,
    language: req.body.language
  });

  try {
    const { code, review, language } = req.body;
    
    // Validate required fields
    if (!code) return res.status(400).json({ message: 'Code is required' });
    if (!review) return res.status(400).json({ message: 'Review is required' });
    if (!req.user?.id) return res.status(401).json({ message: 'User ID missing' });
    
    // Direct database insertion using MongoDB driver for maximum control
    const db = mongoose.connection;
    const reviewsCollection = db.collection('reviews');
    
    const newReview = {
      code,
      review,
      language: language || 'javascript',
      author: new mongoose.Types.ObjectId(req.user.id),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Inserting review with author:', newReview.author);
    
    // Insert directly to bypass Mongoose validation
    const result = await reviewsCollection.insertOne(newReview);
    
    console.log('Database insert result:', result);
    
    if (!result.insertedId) {
      throw new Error('Failed to insert review');
    }
    
    return res.status(201).json({
      _id: result.insertedId,
      ...newReview,
      author: newReview.author.toString() // Convert ObjectId to string for response
    });
    
  } catch (error) {
    console.error('=== REVIEW CREATION ERROR ===');
    console.error(error.stack);
    
    // Check for specific MongoDB errors
    if (error.name === 'BSONTypeError') {
      return res.status(400).json({ 
        message: 'Invalid ID format',
        error: error.message
      });
    }
    
    return res.status(500).json({ 
      message: 'Server error during review creation', 
      error: error.message
    });
  }
};

/**
 * Get all reviews for a user
 */
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get a specific review by ID
 */
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    // Check if review exists
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user owns the review
    if (review.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this review' });
    }
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a review
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    // Check if review exists
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user owns the review
    if (review.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export all functions consistently as an object
module.exports = {
  createReview,
  getUserReviews,
  getReviewById,
  deleteReview
};