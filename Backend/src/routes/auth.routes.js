const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Updated import path to match existing model
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { registerUser, loginUser, getUserProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Registration route with enhanced logging
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(`📝 Registration attempt for: ${email}, username: ${username}`);
    
    // Log registration attempt in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Registration attempt:', { username, email });
    }
    
    // Check for required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await newUser.save();
    console.log(`✅ User registered: ${username}, ID: ${newUser._id}`);
    
    // Set expiration to 7 days
    const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
    
    // Generate JWT token with consistent format
    const token = jwt.sign(
      { 
        id: newUser._id, 
        username: newUser.username,
        email: newUser.email
      }, 
      process.env.JWT_SECRET,
      { expiresIn }
    );
    
    // Return consistent response with expiry information
    res.status(201).json({
      token,
      expiresIn,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors[0] });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        message: `${field === 'email' ? 'Email' : 'Username'} is already in use` 
      });
    }
    
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login route with enhanced logging
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔑 Login attempt for email: ${email}`);
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ Login failed: No user found with email ${email}`);
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`❌ Login failed: Invalid password for ${email}`);
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Set expiration to 7 days
    const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
    
    // Generate JWT token with consistent format
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username,
        email: user.email 
      }, 
      process.env.JWT_SECRET,
      { expiresIn }
    );
    
    // Update last login time
    user.lastLogin = Date.now();
    await user.save();
    
    console.log(`✅ Login successful for user: ${user.username}`);
    
    // Return consistent response with expiry information
    res.json({
      token,
      expiresIn,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Check if username or email exists (for form validation)
router.get('/check', async (req, res) => {
  try {
    const { username, email } = req.query;
    let query = {};
    
    if (username) query.username = username;
    if (email) query.email = email;
    
    if (Object.keys(query).length === 0) {
      return res.status(400).json({ message: 'No parameters provided' });
    }
    
    const existingUser = await User.findOne(query);
    res.json({ exists: !!existingUser });
    
  } catch (error) {
    console.error('Check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify JWT token (for client-side validation)
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ valid: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(400).json({ valid: false, message: 'User not found' });
    }
    
    res.json({ 
      valid: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

// @route   GET /api/auth/profile
router.get('/profile', protect, getUserProfile);

// Add a refresh token endpoint
router.post('/refresh-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    console.log(`🔄 Token refresh request received`);
    
    // Verify the existing token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log(`❌ Token refresh failed: User not found for ID: ${decoded.id}`);
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Set expiration to 7 days
    const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
    
    // Generate a new token
    const newToken = jwt.sign(
      { 
        id: user._id, 
        username: user.username,
        email: user.email 
      }, 
      process.env.JWT_SECRET,
      { expiresIn }
    );
    
    console.log(`✅ Token refreshed for user: ${user.username}`);
    
    res.json({
      token: newToken,
      expiresIn,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;