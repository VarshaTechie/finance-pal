const express = require('express');
const router = express.Router();
const { exportToCSV } = require('../controllers/exportController');
const { validateObjectId } = require('../middleware/validateRequest');

// GET /api/export/:userId - Export user's financial data as CSV
router.get('/:userId', validateObjectId('userId'), exportToCSV);

module.exports = router;

