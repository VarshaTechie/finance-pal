const express = require('express');
const router = express.Router();
const { getFinancialNews } = require('../controllers/newsController');

// GET /api/news - Get financial news
router.get('/', getFinancialNews);

module.exports = router;
