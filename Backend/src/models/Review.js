const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Code cannot be empty'
    }
  },
  review: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Review cannot be empty'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid author ID'
    }
  }
}, {
  timestamps: true,
  strict: true,
  strictQuery: true
});

reviewSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Review', reviewSchema);