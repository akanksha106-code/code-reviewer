const axios = require('axios');
const { DEFAULT_MODEL, GENERATION_CONFIG, SAFETY_SETTINGS } = require('../config/ai.config');

class AIService {
  constructor() {
    this.initialized = false;
    this.apiKey = null;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.initialize();
  }

  initialize() {
    this.apiKey = process.env.GOOGLE_GEMINI_KEY || process.env.GOOGLE_API_KEY;
    
    if (!this.apiKey) {
      console.error('❌ ERROR: No Gemini API key found in environment variables');
      return;
    }
    
    this.initialized = true;
    console.log('✅ Gemini API service initialized successfully');
  }

  async isAvailable() {
    if (!this.initialized || !this.apiKey) {
      return false;
    }
    
    try {
      // Make a simple API call to check if Gemini is available
      const response = await axios.get(`${this.baseUrl}/models?key=${this.apiKey}`);
      return response.status === 200;
    } catch (error) {
      console.error('AI service availability check failed:', error.message);
      return false;
    }
  }

  async generateCodeReview(code, language, style = 'detailed') {
    if (!this.initialized || !this.apiKey) {
      throw new Error('AI service not initialized');
    }

    // Create the review prompt
    const prompt = `You are an experienced software engineer reviewing code. Provide a thorough but constructive code review.

${style === 'concise' 
  ? 'Be brief and focus only on the most important issues.'
  : 'Provide a detailed analysis including both issues and positive aspects.'}

Code to review (${language}):
\`\`\`${language}
${code}
\`\`\`

Your review should include:
1. A brief overview of the code purpose and structure
2. Potential bugs, errors, or issues in the code
3. Best practices that aren't being followed
4. Security concerns if applicable
5. Performance considerations
6. Positive aspects of the code that are well done
7. Specific suggestions for improvement with example code where helpful

Format your response in Markdown with proper headings and code blocks.
Be specific and reference line numbers or code segments where appropriate.
Be professional and constructive in your feedback.`;

    // Choose the appropriate configuration based on style
    const genConfig = GENERATION_CONFIG[style] || GENERATION_CONFIG.detailed;
    
    console.log(`Using direct Gemini API call for code review with ${style} style`);
    
    // Use correct model name gemini-2.0-flash as per documentation
    const endpoint = `${this.baseUrl}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
    
    try {
      // Make direct API request to Gemini with the correct structure
      const response = await axios.post(endpoint, {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: genConfig,
        safetySettings: SAFETY_SETTINGS
      });
      
      const result = response.data;
      
      // Check if the response has a prompt feedback with block reason
      if (result.promptFeedback && result.promptFeedback.blockReason) {
        throw new Error(`Content blocked: ${result.promptFeedback.blockReason}`);
      }
      
      // Extract the text from the response
      if (result.candidates && result.candidates.length > 0 && 
          result.candidates[0].content && 
          result.candidates[0].content.parts && 
          result.candidates[0].content.parts.length > 0) {
        
        return result.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Unexpected API response format');
      }
      
    } catch (error) {
      console.error('Gemini API error:', error.message);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        throw new Error(
          `Gemini API error: ${error.response.status} - ${
            error.response.data.error?.message || 'Unknown error'
          }`
        );
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from Gemini API');
      } else {
        // Something happened in setting up the request that triggered an error
        throw error;
      }
    }
  }
}

// Create a singleton instance
const aiService = new AIService();

module.exports = aiService;