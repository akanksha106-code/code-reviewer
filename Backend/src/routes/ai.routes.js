const express = require('express');
const router = express.Router();
const aiFactory = require('../services/ai.factory');

// AI Code Review endpoint
router.post('/review', async (req, res) => {
  try {
    const { code, language = 'javascript', reviewStyle = 'detailed' } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Code is required' });
    }
    
    // Get the appropriate AI service (real or mock)
    const aiService = await aiFactory.getService();
    
    console.log(`🔍 Processing code review request for ${language} (${code.length} chars)`);
    
    // Set a timeout for the API call
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI request timed out')), 60000) // 60-second timeout
    );
    
    // Make the API call with the service
    const reviewPromise = aiService.generateCodeReview(code, language, reviewStyle);
    
    // Race the promises
    const review = await Promise.race([reviewPromise, timeoutPromise]);
    
    console.log(`✅ Code review generated successfully (${review.length} chars)`);
    
    res.json({ review });
  } catch (error) {
    console.error('❌ AI service error:', error);
    
    // Specific error handling
    if (error.message === 'AI request timed out') {
      return res.status(408).json({ 
        message: 'AI request timed out. Please try again with a smaller code sample.',
        isTimeout: true
      });
    }
    
    if (error.message && error.message.includes('blocked')) {
      return res.status(422).json({ 
        message: 'Content was blocked by AI safety filters. Please modify your request.' 
      });
    }
    
    // Handle rate limiting with updated error format
    if (error.message && (
        error.message.includes('quota') || 
        error.message.includes('rate') || 
        error.message.includes('limit')
      )) {
      return res.status(429).json({ 
        message: 'AI service quota exceeded. Please try again later.' 
      });
    }
    
    // Generic error
    res.status(500).json({ 
      message: 'An error occurred while processing your request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint for AI service
router.get('/health', async (req, res) => {
  const aiService = await aiFactory.getService();
  const available = await aiService.isAvailable();
  const isMock = aiService === aiFactory.mockService;
  
  const status = {
    service: 'AI Service',
    type: isMock ? 'Mock AI Service' : 'Google Gemini API',
    model: isMock ? 'mock' : 'gemini-2.0-flash',
    status: available ? 'operational' : 'unavailable',
    isMock,
    forceMock: aiFactory.forceMock,
    timestamp: new Date().toISOString()
  };
  
  if (!available) {
    return res.status(503).json(status);
  }
  
  res.json(status);
});

module.exports = router;

