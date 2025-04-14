const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Updated import path

const protect = async (req, res, next) => {
  console.log(`🔒 Auth check for: ${req.originalUrl}`);
  let token;
  
  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log(`🔑 Token received: ${token.substring(0, 15)}...`);
      
      if (!token) {
        console.log('❌ No token provided in Authorization header');
        return res.status(401).json({ message: 'Not authorized, no token' });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`✓ Token verified for user ID: ${decoded.id}`);
      
      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.log(`❌ User not found for ID: ${decoded.id}`);
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log(`✅ Auth successful for user: ${req.user.username}`);
      next();
    } catch (error) {
      console.error('🚫 Authentication error:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token', code: 'INVALID_TOKEN' });
      }
      
      return res.status(401).json({ message: 'Not authorized', code: 'AUTH_FAILED' });
    }
  } else {
    console.log('❌ No Authorization header found');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Admin middleware
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };