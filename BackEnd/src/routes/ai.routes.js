const express = require('express');
const aiController = require("../controllers/ai.controller")

const router = express.Router();

// Handle POST requests to get a review (likely with input data)
router.post("/get-review", aiController.getReview);

// Handle GET requests to get a review (if you have a default or different logic)
router.get("/get-review", aiController.getDefaultReview);

module.exports = router;    

  