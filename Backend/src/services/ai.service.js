const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GOOGLE_GEMINI_KEY) {
  console.error('ERROR: GOOGLE_GEMINI_KEY environment variable is not set');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

// Configure the model with system instruction for concise reviews
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `
                You are a senior code reviewer with 7+ years of development experience.

                Your task is to provide CONCISE, focused code reviews that help developers improve their code.

                Guidelines for Review:
                1. Be brief and direct - use no more than 2-3 sentences per issue
                2. Focus ONLY on the most important 2-3 issues
                3. Skip minor stylistic issues unless they impact functionality
                4. Provide short, specific code examples for fixes when relevant
                5. Never explain basic concepts in detail
                6. Use bullet points for clarity
                7. Be constructive but direct

                Output Format:
                - Write a very brief summary (max 1-2 sentences)
                - Use emoji bullet points for issues (max 3 issues)
                - Each issue should include a very brief explanation and an example fix if applicable
                - Keep the entire review under 15 lines
                - Focus on practical improvements, not theory

                Remember: Developers want quick, actionable feedback, not lengthy explanations.
    `
});

/**
 * Generates AI content based on the provided code prompt
 * @param {string} prompt - The code to review
 * @param {string} reviewStyle - The review style ('detailed' or 'concise')
 * @returns {Promise<string>} - The AI-generated review
 */
async function generateContent(prompt, reviewStyle = 'concise') {
    if (!prompt || typeof prompt !== 'string') {
        console.error('Invalid prompt provided:', prompt);
        throw new Error('Invalid prompt: Must provide a non-empty string');
    }

    try {
        console.log('Sending prompt to Gemini API...');
        
        // Add instructions for concise review
        let promptWithInstructions = prompt;
        if (reviewStyle === 'concise') {
            promptWithInstructions = `
${prompt}

Please provide a CONCISE code review focusing only on the most important 2-3 issues. 
Keep explanations brief and direct. Use bullet points. Total response should be less than 15 lines.`;
        }
        
        const result = await model.generateContent(promptWithInstructions);
        
        if (!result.response) {
            console.error('Empty response from Gemini API');
            throw new Error('Failed to get response from AI service');
        }
        
        const responseText = result.response.text();
        console.log('Successfully received response from Gemini API');
        
        return responseText;
    } catch (error) {
        console.error('Error generating content from Gemini API:', error);
        throw new Error(`AI service error: ${error.message || 'Unknown error'}`);
    }
}

module.exports = generateContent