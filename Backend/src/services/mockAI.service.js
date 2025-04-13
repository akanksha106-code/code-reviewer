/**
 * Mock AI service for when the real API is unavailable or for testing
 */

class MockAIService {
  constructor() {
    this.initialized = true;
    console.log('💡 Mock AI Service initialized');
  }

  async isAvailable() {
    return true;
  }

  async generateCodeReview(code, language, style = 'detailed') {
    console.log(`Generating mock code review for ${language} code`);
    
    // Wait a bit to simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock review
    return this.createMockReview(code, language, style);
  }

  createMockReview(code, language, style) {
    const codeLines = code.split('\n').length;
    const isConcise = style === 'concise';
    
    return `# Code Review - ${language.toUpperCase()} (${isConcise ? 'Concise' : 'Detailed'})

## Overview
The code is ${codeLines < 10 ? 'quite short' : 'moderately sized'} (${codeLines} lines) and appears to be ${language} code. ${
      isConcise ? '' : 'Based on a quick analysis, here are my observations and recommendations.'
    }

## Code Quality
${
  isConcise 
    ? '- Overall structure is reasonable but could be improved'
    : '- The code structure follows basic patterns but there are opportunities for improvement\n- Variable naming is generally good but could be more consistent'
}

## Potential Issues
${
  isConcise
    ? '- Consider adding error handling'
    : '- There\'s limited error handling which could lead to unexpected behavior\n- Some edge cases may not be properly handled'
}

## Recommendations
${
  isConcise
    ? '- Add comments to explain complex logic\n- Implement proper error handling'
    : '- Add more comprehensive comments to explain the purpose of functions\n- Implement proper error handling with try/catch blocks\n- Consider adding input validation to prevent unexpected behavior'
}

*Note: This is a mock review generated for demonstration purposes. For actual code analysis, please use the real AI service.*`;
  }
}

module.exports = new MockAIService();
