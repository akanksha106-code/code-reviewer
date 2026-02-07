const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    maxlength: [50000, 'Code cannot exceed 50,000 characters']
  },
  review: {
    type: String,
    required: [true, 'Review is required']
  },
  language: {
    type: String,
    required: [true, 'Language is required'],
    enum: ['javascript', 'python', 'java', 'csharp', 'cpp', 'php', 'go', 'ruby', 'typescript', 'rust'],
    default: 'javascript'
  },
  reviewStyle: {
    type: String,
    enum: ['detailed', 'concise'],
    default: 'detailed'
  },
  // Optional fields for future features
  codeSnippetName: {
    type: String,
    maxlength: [100, 'Code snippet name cannot exceed 100 characters']
  },
  tags: [{
    type: String,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  // Metadata
  aiModel: {
    type: String,
    default: 'gemini-2.0-flash'
  },
  reviewDuration: {
    type: Number, // Time taken to generate review in milliseconds
  },
  codeLength: {
    type: Number
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
ReviewSchema.index({ user: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, language: 1 });
ReviewSchema.index({ language: 1, createdAt: -1 });
ReviewSchema.index({ tags: 1 });

// Pre-save hook to calculate code length
ReviewSchema.pre('save', function(next) {
  if (this.isModified('code')) {
    this.codeLength = this.code.length;
  }
  next();
});

// Static method to get user statistics
ReviewSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$language',
        count: { $sum: 1 },
        avgCodeLength: { $avg: '$codeLength' },
        avgReviewDuration: { $avg: '$reviewDuration' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return stats;
};

// Instance method to check ownership
ReviewSchema.methods.isOwnedBy = function(userId) {
  return this.user.toString() === userId.toString();
};

module.exports = mongoose.model('Review', ReviewSchema);
