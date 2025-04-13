/**
 * Validation middleware for user registration and login
 */

const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = {};
  
  // Validate username
  if (!username) {
    errors.username = 'Username is required';
  } else if (username.length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  } else if (username.length > 30) {
    errors.username = 'Username cannot exceed 30 characters';
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = 'Username can only contain letters, numbers, and underscores';
  }
  
  // Validate email
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Please provide a valid email address';
  }
  
  // Validate password
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }
  
  // If there are errors, return them
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};
  
  // Validate email
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Please provide a valid email address';
  }
  
  // Validate password
  if (!password) {
    errors.password = 'Password is required';
  }
  
  // If there are errors, return them
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

const validateReviewData = (req, res, next) => {
  const { code, language } = req.body;
  const errors = {};
  
  // Validate code
  if (!code) {
    errors.code = 'Code is required';
  }
  
  // Validate language
  if (!language) {
    errors.language = 'Programming language is required';
  }
  
  // If there are errors, return them
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateReviewData
};
