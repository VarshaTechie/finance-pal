const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, deleteExpense } = require('../controllers/expenseController');
const { validateRequiredFields, validateObjectId, sanitizeInput } = require('../middleware/validateRequest');

// POST /api/expenses - Add new expense
router.post(
    '/',
    sanitizeInput,
    validateRequiredFields(['userId', 'amount', 'category']),
    addExpense
);

// GET /api/expenses/:userId - Get user expenses
router.get('/:userId', validateObjectId('userId'), getExpenses);

// DELETE /api/expenses/:expenseId - Delete expense
router.delete('/:expenseId', validateObjectId('expenseId'), deleteExpense);

module.exports = router;
