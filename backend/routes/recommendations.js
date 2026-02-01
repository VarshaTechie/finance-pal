const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const { validateObjectId } = require('../middleware/validateRequest');

// GET /api/recommendations/:userId - Get savings recommendations
router.get('/:userId', validateObjectId('userId'), getRecommendations);

module.exports = router;
