const realAIService = require('./ai.service');
const mockAIService = require('./mockAI.service');

/**
 * AI Factory to determine which AI service to use
 * - Falls back to mock service if real service fails
 * - Can be forced to use mock service with USE_MOCK_AI env variable
 */
class AIFactory {
  constructor() {
    this.realService = realAIService;
    this.mockService = mockAIService;
    
    // Check if we should force using the mock service
    this.forceMock = process.env.USE_MOCK_AI === 'true';
    
    if (this.forceMock) {
      console.log('🔄 Using mock AI service as specified in environment variables');
    }
  }
  
  async getService() {
    // If we're forcing the use of the mock service, return it
    if (this.forceMock) {
      return this.mockService;
    }
    
    // Otherwise, check if the real service is available
    try {
      const isRealAvailable = await this.realService.isAvailable();
      
      if (isRealAvailable) {
        console.log('✅ Using real Gemini API service');
        return this.realService;
      } else {
        console.log('⚠️ Real AI service unavailable, falling back to mock service');
        return this.mockService;
      }
    } catch (error) {
      console.error('❌ Error checking real AI service availability:', error.message);
      console.log('⚠️ Falling back to mock AI service');
      return this.mockService;
    }
  }
}

module.exports = new AIFactory();
