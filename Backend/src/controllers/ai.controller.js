const mockAIService = require('../services/mock-ai.service');
const GeminiApiService = require('../services/gemini-api.service');

// Initialize API service with key from environment
const apiKey = process.env.GOOGLE_GEMINI_KEY;
const geminiService = apiKey ? new GeminiApiService(apiKey) : null;

// Flag to control which service to use
const USE_MOCK = process.env.USE_MOCK_AI === 'true';

// Test the API on startup
(async () => {
  if (geminiService) {
    const test = await geminiService.testConnection();
    console.log(test.success 
      ? `🎉 Gemini API connected successfully using model: ${test.model}`
      : `⚠️ Gemini API connection failed: ${test.error}`
    );
  } else {
    console.log('⚠️ No API key found, using mock service only');
  }
})();

/**
 * Controller for generating code reviews
 */
const getReview = async (req, res) => {
  const { 
    code, 
    language = 'javascript',
    reviewStyle = 'detailed' 
  } = req.body;

  // Set a timeout for the request
  const requestTimeout = setTimeout(() => {
    console.log('AI review request timed out internally');
    // Note: We don't send a response here as the request might still be processing
  }, 25000); // 25 seconds internal timeout warning

  if (!code) {
    clearTimeout(requestTimeout);
    return res.status(400).json({
      success: false,
      message: "Code is required for review"
    });
  }

  try {
    console.log(`Processing code review request for ${language} code (${reviewStyle} style)`);
    
    // Decide which service to use
    let result;
    
    // Check code length and adjust review style for large inputs
    const codeLength = code.length;
    let actualReviewStyle = reviewStyle;
    
    // For large code samples, default to concise to avoid timeouts
    if (codeLength > 5000 && reviewStyle === 'detailed') {
      console.log('Large code sample detected, using concise review style');
      actualReviewStyle = 'concise';
    }
    
    console.log(`Processing ${actualReviewStyle} review for ${language} code (${codeLength} chars)`);
    
    if (USE_MOCK || !geminiService) {
      console.log('Using mock AI service');
      result = await mockAIService.generateReview(code, language, actualReviewStyle);
    } else {
      console.log('Using Gemini API service');
      try {
        result = await geminiService.generateReview(code, language, actualReviewStyle);
      } catch (apiError) {
        console.error('Gemini API failed, falling back to mock:', apiError.message);
        result = await mockAIService.generateReview(code, language, actualReviewStyle);
        result.metadata.fallback = true;
      }
    }
    
    clearTimeout(requestTimeout);
    return res.json(result);
  } catch (error) {
    clearTimeout(requestTimeout);
    console.error('AI Review Error:', error);
    
    // Customize error message based on error type
    let errorMessage = "Failed to generate code review";
    if (error.message?.includes('timeout')) {
      errorMessage = "The review process took too long. Try with a smaller code sample or choose 'concise' review style.";
    }
    
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
};

module.exports = { getReview };