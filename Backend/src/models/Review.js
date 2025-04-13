const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  review: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  // Optional fields for future use
  codeSnippetName: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
ReviewSchema.index({ user: 1, createdAt: -1 });
ReviewSchema.index({ language: 1 });

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;