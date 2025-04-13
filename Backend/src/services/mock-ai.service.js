/**
 * Mock AI service for reliable code review development
 */
class MockAIService {
  constructor() {
    console.log('🤖 Initializing Mock AI Service');
  }

  /**
   * Generate a realistic mock review based on code and options
   */
  async generateReview(code, language, style = 'detailed') {
    console.log(`📝 Generating mock ${style} review for ${language} code`);
    
    // Extract basic metrics from code for a more realistic review
    const metrics = this._analyzeCode(code, language);
    
    // Create customized mock review based on code characteristics
    const review = this._createCustomizedReview(metrics, language, style);
    
    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      success: true,
      review,
      metadata: {
        language,
        reviewStyle: style,
        timestamp: new Date().toISOString(),
        isMock: true,
        metrics
      }
    };
  }

  /**
   * Extract basic metrics from code for more realistic reviews
   */
  _analyzeCode(code, language) {
    const lineCount = code.split('\n').length;
    const charCount = code.length;
    
    // Check for common patterns
    const hasComments = code.includes('//') || code.includes('/*');
    const hasFunctions = code.includes('function') || code.includes('=>');
    const hasClasses = code.includes('class ');
    const hasImports = code.includes('import ') || code.includes('require(');
    
    return {
      lineCount,
      charCount,
      hasComments,
      hasFunctions,
      hasClasses,
      hasImports,
      complexity: this._estimateComplexity(code)
    };
  }

  /**
   * Estimate code complexity based on simple heuristics
   */
  _estimateComplexity(code) {
    let complexity = 'simple';
    
    const lines = code.split('\n').length;
    const nestingLevel = this._countMaxNesting(code);
    
    if (lines > 30 || nestingLevel > 3) {
      complexity = 'moderate';
    }
    
    if (lines > 100 || nestingLevel > 5) {
      complexity = 'complex';
    }
    
    return complexity;
  }

  /**
   * Count maximum nesting level in code (rough estimate)
   */
  _countMaxNesting(code) {
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (const char of code) {
      if (char === '{' || char === '(' || char === '[') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}' || char === ')' || char === ']') {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }
    
    return maxDepth;
  }

  /**
   * Create customized review based on code metrics
   */
  _createCustomizedReview(metrics, language, style) {
    const templates = style === 'concise' ? conciseTemplates : detailedTemplates;
    
    // Select appropriate template based on complexity
    const template = templates[metrics.complexity] || templates.simple;
    
    // Replace placeholders in template
    let review = template
      .replace(/\{language\}/g, language)
      .replace(/\{lineCount\}/g, metrics.lineCount)
      .replace(/\{complexity\}/g, metrics.complexity);
      
    // Add conditional sections
    if (!metrics.hasComments) {
      review += '\n\n**Missing Comments**: The code lacks proper documentation. Consider adding comments to explain complex logic.';
    }
    
    if (metrics.hasClasses && metrics.complexity !== 'simple') {
      review += '\n\n**Class Design**: Consider reviewing your class structure for better encapsulation and separation of concerns.';
    }
    
    return review;
  }
}

const conciseTemplates = {
  simple: `## Code Review Summary

* **Overall Quality**: Generally good, with minor issues
* **Key Points**: 
  * Simple {language} implementation
  * Good basic structure for {lineCount} lines of code
  * Clean and readable

**Suggestions:**
1. Add error handling for edge cases
2. Consider adding more comments for clarity
3. Add unit tests for validation`,

  moderate: `## Code Review Summary

* **Overall Quality**: Moderate complexity with some concerns
* **Key Issues**: 
  * Missing error handling in key functions
  * Potential for code duplication in several areas
  * Some naming could be more descriptive

**Suggested Fixes:**
1. Add try/catch blocks around critical operations
2. Extract repeated logic into helper functions
3. Improve variable naming for better readability
4. Add input validation to prevent unexpected behavior`,

  complex: `## Code Review Summary

* **Overall Quality**: Complex codebase with significant issues
* **Critical Concerns**: 
  * High cyclomatic complexity in multiple functions
  * Lack of proper error boundaries
  * Potential performance bottlenecks
  * Security vulnerabilities in data handling

**Priority Fixes:**
1. Refactor large functions into smaller, more manageable pieces
2. Implement comprehensive error handling strategy
3. Add input validation and sanitization
4. Review performance-critical sections for optimization`
};

const detailedTemplates = {
  simple: `# Code Review: {language} Implementation

## Code Quality and Best Practices
- Overall well-structured and clean {language} code
- Good use of standard practices for this simple implementation
- Variable naming is generally clear and descriptive
- Code is concise at {lineCount} lines

## Potential Issues
- Error handling could be improved for edge cases
- Some functions could benefit from additional input validation
- Consider adding parameter type checking

## Performance Considerations
- No significant performance concerns for this simple implementation
- Standard {language} operations used appropriately

## Security Considerations
- No major security concerns identified in this simple code
- Always validate user inputs in production environments

## Suggestions for Improvement
1. Add basic error handling with try/catch blocks
2. Consider adding JSDoc style comments for better documentation
3. Add unit tests for full coverage
4. Consider adding type validation for function parameters

Overall, this is a solid implementation with good foundational practices. The suggestions above would help make this production-ready.`,

  moderate: `# Comprehensive Code Review: {language}

## Code Quality and Best Practices
- Moderately complex {language} code with reasonable organization
- Some functions follow best practices, while others need improvement
- Variable naming is inconsistent in some areas
- Code structure shows understanding of {language} patterns

## Potential Bugs and Issues
- Several edge cases are not handled properly
- Potential null/undefined references not checked
- Error propagation is inconsistent throughout the codebase
- Some conditionals could lead to unexpected behavior

## Performance Considerations
- Several areas could benefit from optimization:
  * Repeated calculations could be memoized
  * Some loops could be optimized or combined
  * Consider more efficient data structures for key operations

## Security Concerns
- Input validation is missing in several critical areas
- Potential for injection vulnerabilities if handling user input
- Data sanitization should be implemented throughout

## Suggestions for Improvement
1. Implement consistent error handling strategy
2. Add comprehensive input validation
3. Standardize coding patterns across the codebase
4. Consider extracting common functionality into reusable utilities
5. Add thorough comments for complex logic sections
6. Implement unit tests for all significant functions

This code has a good foundation but would benefit from refactoring to address the issues noted above before using in production.`,

  complex: `# Detailed Code Review: Complex {language} Implementation

## Code Quality and Best Practices
- Complex codebase with mixed adherence to {language} best practices
- File organization needs improvement - consider breaking into modules
- Naming conventions are inconsistent across components
- Documentation is insufficient for the level of complexity
- Some patterns are well-implemented while others need significant refactoring

## Potential Bugs and Issues
- High cyclomatic complexity increases risk of bugs in multiple functions
- Error handling is incomplete or missing in critical sections
- Race conditions possible in asynchronous operations
- Multiple edge cases not addressed
- Type inconsistencies could lead to unexpected behavior

## Performance Considerations
- Several performance bottlenecks identified:
  * Inefficient algorithms in critical paths
  * Unnecessary re-computations
  * Suboptimal data structures for key operations
  * Potential memory leaks from unmanaged resources
- Consider profiling and benchmarking key functions

## Security Concerns
- Multiple security vulnerabilities detected:
  * Improper input validation
  * Potential for injection attacks
  * Insecure data handling practices
  * Missing authorization checks
- Security audit strongly recommended

## Architecture Recommendations
- Consider restructuring using more appropriate design patterns
- Implement proper separation of concerns
- Add abstraction layers where appropriate
- Improve modularity for better maintainability

## Suggestions for Improvement
1. Comprehensive refactoring plan focusing on high-risk areas first
2. Implement thorough error handling strategy
3. Add extensive unit and integration tests
4. Improve documentation with JSDoc comments
5. Conduct security review and implement fixes
6. Optimize identified performance bottlenecks
7. Consider type checking tools for increased safety

This complex codebase requires significant refactoring to meet production standards. Recommend tackling issues incrementally, starting with the most critical concerns.`
};

const mockAIService = new MockAIService();
module.exports = mockAIService;
