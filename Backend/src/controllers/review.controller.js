const Review = require('../models/Review');

// @desc    Save a new code review
// @route   POST /api/reviews
// @access  Private
exports.saveReview = async (req, res) => {
  try {
    const { codeSubmitted, language, aiReview } = req.body;

    const review = await Review.create({
      user: req.user._id,
      codeSubmitted,
      language,
      aiReview
    });

    if (review) {
      res.status(201).json(review);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reviews for a user
// @route   GET /api/reviews
// @access  Private
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a specific review
// @route   GET /api/reviews/:id
// @access  Private
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    // Check if review exists
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this review' });
    }
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    // Check if review exists
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    await review.remove();
    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 