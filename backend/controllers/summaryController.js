const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const { HTTP_STATUS } = require('../utils/constants');
const { aggregateByCategory, getCurrentMonthRange, getPreviousMonthRange } = require('../utils/helpers');

/**
 * Get financial summary for a user
 * GET /api/summary/:userId
 * Query params: startDate, endDate (optional, defaults to current month)
 */
const getSummary = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        // Fetch user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        // Determine date range for CURRENT period
        let dateFilter = {};
        let prevDateFilter = null; // Comparison filter

        let currentPeriodStart;
        let currentPeriodEnd;

        if (startDate || endDate) {
            dateFilter.date = {};
            const start = new Date(startDate);
            currentPeriodStart = start;
            const end = endDate ? new Date(endDate) : new Date(start.getFullYear(), start.getMonth() + 1, 0);
            currentPeriodEnd = end;

            if (startDate) dateFilter.date.$gte = start;
            if (endDate) dateFilter.date.$lte = end;

            // Calculate previous month relative to the selection
            const prevStart = new Date(start);
            prevStart.setMonth(prevStart.getMonth() - 1);

            const prevEnd = new Date(start);
            prevEnd.setDate(0);

            prevDateFilter = { date: { $gte: prevStart, $lte: prevEnd } };
        } else {
            // Default to current month
            const { firstDay, lastDay } = getCurrentMonthRange();
            currentPeriodStart = firstDay;
            currentPeriodEnd = lastDay;
            dateFilter.date = { $gte: firstDay, $lte: lastDay };

            // Calculate previous month for comparison
            const prevRange = getPreviousMonthRange();
            prevDateFilter = { date: { $gte: prevRange.firstDay, $lte: prevRange.lastDay } };
        }

        // Fetch expenses for current period
        const expenses = await Expense.find({
            userId,
            ...dateFilter
        });

        // Determine Effective Income for the selected period
        // Instead of only looking at a single month, we now SUM ALL income
        // entries that fall within the current period date range.
        let effectiveMonthlyIncome = user.monthlyIncome;
        if (currentPeriodStart && currentPeriodEnd) {
            const incomeRangeStart = new Date(currentPeriodStart.getFullYear(), currentPeriodStart.getMonth(), 1);
            const incomeRangeEnd = new Date(currentPeriodEnd.getFullYear(), currentPeriodEnd.getMonth(), 1);

            const incomeDocs = await Income.find({
                userId,
                month: { $gte: incomeRangeStart, $lte: incomeRangeEnd }
            });

            if (incomeDocs.length > 0) {
                effectiveMonthlyIncome = incomeDocs.reduce((sum, inc) => sum + inc.amount, 0);
            }
        }

        // Fetch expenses for previous period (if applicable)
        let previousExpenses = [];
        let prevMonthlyIncome = user.monthlyIncome;

        if (prevDateFilter) {
            previousExpenses = await Expense.find({
                userId,
                ...prevDateFilter
            });

            // Get total income for the previous period (sum of all income docs in that range)
            const prevStart = prevDateFilter.date.$gte;
            const prevEnd = prevDateFilter.date.$lte;
            const prevIncomeRangeStart = new Date(prevStart.getFullYear(), prevStart.getMonth(), 1);
            const prevIncomeRangeEnd = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1);

            const prevIncomeDocs = await Income.find({
                userId,
                month: { $gte: prevIncomeRangeStart, $lte: prevIncomeRangeEnd }
            });

            if (prevIncomeDocs.length > 0) {
                prevMonthlyIncome = prevIncomeDocs.reduce((sum, inc) => sum + inc.amount, 0);
            } else {
                // If no specific income found, fall back to the user's base income
                prevMonthlyIncome = user.monthlyIncome;
            }
        }

        // Calculate totals - Current
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const categoryBreakdown = aggregateByCategory(expenses);
        const remainingBalance = effectiveMonthlyIncome - totalExpenses;
        const savingsRate = effectiveMonthlyIncome > 0
            ? ((remainingBalance / effectiveMonthlyIncome) * 100).toFixed(2)
            : 0;

        // Calculate totals - Previous
        const prevTotalExpenses = previousExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Calculate Changes (Current - Previous)
        const incomeChange = effectiveMonthlyIncome - prevMonthlyIncome; // Dynamic!
        const expenseChange = totalExpenses - prevTotalExpenses;
        const savingsChange = (effectiveMonthlyIncome - totalExpenses) - (prevMonthlyIncome - prevTotalExpenses);

        const roundedRemaining = Math.round(remainingBalance);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                monthlyIncome: effectiveMonthlyIncome, // Send effective income
                totalExpenses: Math.round(totalExpenses),
                remainingBalance: roundedRemaining,
                // Alias for frontend/docs that expect `balance`
                balance: roundedRemaining,
                savingsRate: parseFloat(savingsRate),
                categoryBreakdown,
                expenseCount: expenses.length,
                period: {
                    start: dateFilter.date?.$gte || getCurrentMonthRange().firstDay,
                    end: dateFilter.date?.$lte || getCurrentMonthRange().lastDay
                },
                // Comparison Data
                comparison: {
                    previousTotalExpenses: Math.round(prevTotalExpenses),
                    expenseChange: Math.round(expenseChange),
                    incomeChange: incomeChange,
                    savingsChange: Math.round(savingsChange)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSummary
};
