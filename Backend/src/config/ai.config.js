/**
 * AI Service Configuration
 * Contains settings for different AI models and their parameters
 */

// Default model to use for code reviews
const DEFAULT_MODEL = 'gemini-2.0-flash';

// Generation configurations for different review styles
const GENERATION_CONFIG = {
  // Detailed review settings - more thorough analysis
  detailed: {
    temperature: 0.2,    // Lower temperature for more focused responses
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 8192, // Allow longer responses for detailed reviews
  },
  // Concise review settings - shorter, more focused feedback
  concise: {
    temperature: 0.4,    // Slightly higher temperature for more varied responses
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 4096, // Shorter output for concise reviews
  }
};

// Safety settings for content filtering - direct API format
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
];

module.exports = {
  DEFAULT_MODEL,
  GENERATION_CONFIG,
  SAFETY_SETTINGS,
};
