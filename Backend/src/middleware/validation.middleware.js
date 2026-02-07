const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .escape(),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Validation rules for code review
 */
const validateCodeReview = [
  body('code')
    .trim()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Code must be between 1 and 50,000 characters'),
  
  body('language')
    .optional()
    .trim()
    .isIn(['javascript', 'python', 'java', 'csharp', 'cpp', 'php', 'go', 'ruby', 'typescript', 'rust'])
    .withMessage('Invalid language'),
  
  body('reviewStyle')
    .optional()
    .trim()
    .isIn(['detailed', 'concise'])
    .withMessage('Review style must be either "detailed" or "concise"'),
  
  handleValidationErrors
];

/**
 * Validation rules for creating a review record
 */
const validateCreateReview = [
  body('code')
    .trim()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Code must be between 1 and 50,000 characters'),
  
  body('review')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Review is required'),
  
  body('language')
    .trim()
    .isIn(['javascript', 'python', 'java', 'csharp', 'cpp', 'php', 'go', 'ruby', 'typescript', 'rust'])
    .withMessage('Invalid language'),
  
  body('reviewStyle')
    .optional()
    .trim()
    .isIn(['detailed', 'concise'])
    .withMessage('Review style must be either "detailed" or "concise"'),
  
  body('codeSnippetName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Code snippet name cannot exceed 100 characters')
    .escape(),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters')
    .escape(),
  
  handleValidationErrors
];

/**
 * Validation rules for updating a review
 */
const validateUpdateReview = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID'),
  
  body('code')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Code must be between 1 and 50,000 characters'),
  
  body('review')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Review cannot be empty'),
  
  body('language')
    .optional()
    .trim()
    .isIn(['javascript', 'python', 'java', 'csharp', 'cpp', 'php', 'go', 'ruby', 'typescript', 'rust'])
    .withMessage('Invalid language'),
  
  body('codeSnippetName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Code snippet name cannot exceed 100 characters')
    .escape(),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  handleValidationErrors
];

/**
 * Validation rules for MongoDB ID parameter
 */
const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID'),
  
  handleValidationErrors
];

/**
 * Validation rules for pagination
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('sortBy')
    .optional()
    .trim()
    .isIn(['createdAt', 'updatedAt', 'language'])
    .withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .trim()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be "asc" or "desc"'),
  
  handleValidationErrors
];

/**
 * Sanitize output to prevent XSS
 */
const sanitizeOutput = (data) => {
  if (typeof data === 'string') {
    return data.replace(/[<>]/g, '');
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeOutput);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeOutput(value);
    }
    return sanitized;
  }
  
  return data;
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateCodeReview,
  validateCreateReview,
  validateUpdateReview,
  validateMongoId,
  validatePagination,
  handleValidationErrors,
  sanitizeOutput
};
