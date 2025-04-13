const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Updated import path to match existing model
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { registerUser, loginUser, getUserProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Registration route
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
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
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
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

// Login route
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
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

module.exports = router;