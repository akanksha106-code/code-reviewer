const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

/**
 * Configure Helmet for security headers
 */
const configureHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });
};

/**
 * Configure CORS properly
 */
const configureCORS = () => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];
  
  return cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests) only in development
      if (!origin && process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      if (!origin) {
        return callback(new Error('Not allowed by CORS - no origin'), false);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS - origin ${origin} not in whitelist`), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // 10 minutes
  });
};

/**
 * Rate limiting configurations
 */
const rateLimiters = {
  // General API rate limiter
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health' || req.path === '/health';
    }
  }),
  
  // Strict rate limiter for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    skipSuccessfulRequests: true, // Don't count successful requests
  }),
  
  // Rate limiter for AI review endpoints
  aiReview: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 AI reviews per hour
    message: {
      success: false,
      message: 'AI review quota exceeded, please try again later',
      code: 'AI_RATE_LIMIT_EXCEEDED'
    },
  }),
  
  // Rate limiter for creating reviews
  createReview: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 review creations per hour
    message: {
      success: false,
      message: 'Review creation quota exceeded, please try again later',
      code: 'CREATE_REVIEW_RATE_LIMIT_EXCEEDED'
    },
  })
};

/**
 * Data sanitization middleware
 */
const dataSanitization = [
  // Sanitize data against NoSQL query injection
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized potentially malicious data in ${key}`);
    },
  }),
  
  // Sanitize data against XSS attacks
  xss(),
  
  // Prevent HTTP Parameter Pollution
  hpp({
    whitelist: ['page', 'limit', 'sort', 'language', 'tags'] // Allow these query params to be duplicated
  })
];

/**
 * Request size limiter
 */
const requestSizeLimiter = {
  json: { limit: '10kb' }, // Limit JSON body size
  urlencoded: { limit: '10kb', extended: true } // Limit URL-encoded body size
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Remove powered by header
  res.removeHeader('X-Powered-By');
  
  // Add additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Prevent caching of sensitive data
  if (req.path.includes('/api/auth') || req.path.includes('/api/user')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

/**
 * IP-based request tracking (for advanced rate limiting)
 */
const requestTracker = new Map();

const trackRequest = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestTracker.has(ip)) {
    requestTracker.set(ip, []);
  }
  
  const requests = requestTracker.get(ip);
  
  // Remove requests older than 1 hour
  const recentRequests = requests.filter(timestamp => now - timestamp < 3600000);
  recentRequests.push(now);
  
  requestTracker.set(ip, recentRequests);
  
  // Clean up old entries every 1000 requests
  if (requestTracker.size > 1000) {
    for (const [key, value] of requestTracker.entries()) {
      if (value.length === 0 || now - value[value.length - 1] > 3600000) {
        requestTracker.delete(key);
      }
    }
  }
  
  next();
};

/**
 * Suspicious activity detector
 */
const detectSuspiciousActivity = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const requests = requestTracker.get(ip) || [];
  
  // Check for suspicious patterns
  const recentRequests = requests.filter(timestamp => Date.now() - timestamp < 60000); // Last minute
  
  if (recentRequests.length > 30) {
    console.warn(`Suspicious activity detected from IP: ${ip} - ${recentRequests.length} requests in last minute`);
    
    // You could implement additional actions here:
    // - Send alert
    // - Temporary IP ban
    // - Require CAPTCHA
  }
  
  next();
};

module.exports = {
  configureHelmet,
  configureCORS,
  rateLimiters,
  dataSanitization,
  requestSizeLimiter,
  securityHeaders,
  trackRequest,
  detectSuspiciousActivity
};
