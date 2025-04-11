const aiService = require("../services/ai.service")

/**
 * Controller to handle code review requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
module.exports.getReview = async (req, res) => {
    const { code, reviewStyle = 'concise' } = req.body;

    // Validate request
    if (!code) {
        console.warn('Review request received with missing code');
        return res.status(400).json({ 
            success: false, 
            message: "Code is required for review" 
        });
    }

    try {
        console.log(`Processing code review request (style: ${reviewStyle})`);
        
        // Get review from AI service
        const response = await aiService(code, reviewStyle);
        
        console.log('Review generated successfully');
        res.json(response);
        
    } catch (error) {
        console.error('Error generating code review:', error);
        
        res.status(500).json({ 
            success: false, 
            message: "Failed to generate code review", 
            error: error.message || "Unknown error occurred" 
        });
    }
};

/**
 * Controller to handle default code review requests via GET method
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
module.exports.getDefaultReview = async (req, res) => {
    try {
        console.log('Processing default code review request');
        
        // You could return sample reviews, documentation, or handle query params
        res.json({
            success: true,
            message: "Use POST method with code in request body for a full review",
            examples: [
                { endpoint: "/api/ai/get-review", method: "POST", body: { code: "function example() {}", reviewStyle: "concise" } }
            ]
        });
        
    } catch (error) {
        console.error('Error in default review handler:', error);
        
        res.status(500).json({ 
            success: false, 
            message: "Failed to process request", 
            error: error.message || "Unknown error occurred" 
        });
    }
};