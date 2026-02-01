const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/summaryController');
const { validateObjectId } = require('../middleware/validateRequest');

// GET /api/summary/:userId - Get financial summary
router.get('/:userId', validateObjectId('userId'), getSummary);

module.exports = router;
