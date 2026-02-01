const Expense = require('../models/Expense');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Add a new expense
 * POST /api/expenses
 */
const addExpense = async (req, res, next) => {
    try {
        const { userId, amount, category, date, description } = req.body;

        const expense = await Expense.create({
            userId,
            amount,
            category,
            date: date || new Date(),
            description
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Expense added successfully',
            data: expense
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's expenses with optional filtering
 * GET /api/expenses/:userId
 * Query params: startDate, endDate, category
 */
const getExpenses = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, category } = req.query;

        // Build query
        const query = { userId };

        // Add date range filter if provided
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Add category filter if provided
        if (category) {
            query.category = category;
        }

        const expenses = await Expense.find(query).sort({ date: -1 });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            count: expenses.length,
            data: expenses
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete an expense
 * DELETE /api/expenses/:expenseId
 */
const deleteExpense = async (req, res, next) => {
    try {
        const { expenseId } = req.params;

        const expense = await Expense.findByIdAndDelete(expenseId);

        if (!expense) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addExpense,
    getExpenses,
    deleteExpense
};
