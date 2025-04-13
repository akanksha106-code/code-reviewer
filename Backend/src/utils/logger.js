/**
 * Enhanced logger for debugging
 */
const logger = {
  info: (message, data = {}) => {
    console.log(`[INFO] ${message}`, data);
  },
  
  warn: (message, data = {}) => {
    console.warn(`[WARN] ${message}`, data);
  },
  
  error: (message, error = null, data = {}) => {
    console.error(`[ERROR] ${message}`);
    if (error) {
      console.error(`- ${error.message}`);
      console.error(error.stack);
    }
    if (Object.keys(data).length > 0) {
      console.error('- Context:', data);
    }
  },
  
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  
  request: (req) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
      console.log('- Body:', req.body);
      console.log('- User:', req.user);
      console.log('- Headers:', {
        'content-type': req.headers['content-type'],
        'authorization': req.headers.authorization ? 'Bearer [hidden]' : 'none',
      });
    }
  }
};

module.exports = logger;
