const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'ALLOWED_ORIGINS',
];

function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate specific values
  if (!['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    throw new Error('NODE_ENV must be either development, production, or test');
  }
}

module.exports = validateEnv;
