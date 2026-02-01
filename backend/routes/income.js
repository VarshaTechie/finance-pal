const express = require('express');
const router = express.Router();
const { createOrUpdateIncome, getIncome } = require('../controllers/incomeController');
const { validateObjectId, sanitizeInput } = require('../middleware/validateRequest');

// POST /api/income - Create or update income
router.post('/', sanitizeInput, createOrUpdateIncome);

// GET /api/income/:userId - Get user income
router.get('/:userId', validateObjectId('userId'), getIncome);

module.exports = router;
