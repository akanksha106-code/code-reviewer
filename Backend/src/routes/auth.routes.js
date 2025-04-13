const express = require('express');
const { registerUser, loginUser, getUserProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        console.log('Registration attempt:', req.body);
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: 'Missing required fields' 
            });
        }

        // Your registration logic here
        await registerUser(req, res);

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Registration failed',
            error: error.message 
        });
    }
});

// @route   POST /api/auth/login
router.post('/login', loginUser);

// @route   GET /api/auth/profile
router.get('/profile', protect, getUserProfile);

module.exports = router;