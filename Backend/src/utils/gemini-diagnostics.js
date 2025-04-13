const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Diagnostic function to validate Gemini API configuration
 */
async function diagnoseGeminiAPI() {
  try {
    console.log('🔍 Running Gemini API diagnostics...');
    
    // Check API key
    const apiKey = process.env.GOOGLE_GEMINI_KEY;
    if (!apiKey) {
      console.error('❌ No API key found in environment variables');
      return false;
    }
    
    if (apiKey.startsWith('AIza')) {
      console.log('✅ API key format looks valid');
    } else {
      console.error('❌ API key format appears invalid - should start with "AIza"');
      return false;
    }

    // Initialize API
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try a simple completion to validate key works
    try {
      // Use gemini-1.0-pro-latest or gemini-1.0-pro based on API version
      let model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
      const result = await model.generateContent("Hello, world!");
      console.log('✅ API connection successful!');
      console.log(`✅ Using model: gemini-1.0-pro`);
      return {
        success: true,
        modelName: "gemini-1.0-pro"
      };
    } catch (error) {
      console.error('❌ Error with gemini-1.0-pro:', error.message);
      
      // Try alternative model name
      try {
        let model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello, world!");
        console.log('✅ API connection successful with alternative model name!');
        console.log(`✅ Using model: gemini-pro`);
        return {
          success: true,
          modelName: "gemini-pro"
        };
      } catch (altError) {
        console.error('❌ Error with gemini-pro:', altError.message);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Gemini API diagnostic failed:', error);
    return false;
  }
}

module.exports = { diagnoseGeminiAPI };
