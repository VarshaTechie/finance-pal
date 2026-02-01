const User = require('../models/User');
const Expense = require('../models/Expense');
const Recommendation = require('../models/Recommendation');
const { BUDGET_RECOMMENDATIONS } = require('../utils/constants');
const { aggregateByCategory, calculatePercentage, getCurrentMonthRange } = require('../utils/helpers');

/**
 * Generate savings recommendations based on spending patterns
 */
const generateRecommendations = async (userId) => {
    try {
        // Fetch user data
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const monthlyIncome = user.monthlyIncome;

        if (monthlyIncome === 0) {
            return {
                message: 'Please set your monthly income to get personalized recommendations',
                recommendedSavings: 0,
                categorySuggestions: {}
            };
        }

        // Get current month's expenses
        const { firstDay, lastDay } = getCurrentMonthRange();
        const expenses = await Expense.find({
            userId,
            date: { $gte: firstDay, $lte: lastDay }
        });

        // Calculate total expenses
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Aggregate by category
        const categoryTotals = aggregateByCategory(expenses);

        // Generate category-wise suggestions
        const categorySuggestions = {};
        let totalPotentialSavings = 0;

        Object.keys(BUDGET_RECOMMENDATIONS).forEach(category => {
            const currentSpending = categoryTotals[category] || 0;
            const recommendedPercentage = BUDGET_RECOMMENDATIONS[category];
            const recommendedSpending = (monthlyIncome * recommendedPercentage) / 100;
            const potentialSavings = Math.max(0, currentSpending - recommendedSpending);
            const percentageOfIncome = parseFloat(calculatePercentage(currentSpending, monthlyIncome));

            categorySuggestions[category] = {
                currentSpending,
                recommendedSpending,
                potentialSavings,
                percentageOfIncome,
                status: currentSpending > recommendedSpending ? 'overspending' : 'good'
            };

            if (potentialSavings > 0) {
                totalPotentialSavings += potentialSavings;
            }
        });

        // Calculate expense-to-income ratio
        const expenseToIncomeRatio = parseFloat(calculatePercentage(totalExpenses, monthlyIncome));

        // Determine recommended savings
        let recommendedSavings = totalPotentialSavings;

        // If already saving well, recommend maintaining 20% savings
        if (expenseToIncomeRatio < 80) {
            const currentSavings = monthlyIncome - totalExpenses;
            const idealSavings = monthlyIncome * 0.2;
            recommendedSavings = Math.max(idealSavings - currentSavings, 0);
        }

        // Create recommendation object
        const recommendation = {
            userId,
            recommendedSavings: Math.round(recommendedSavings),
            totalExpenses: Math.round(totalExpenses),
            expenseToIncomeRatio,
            categorySuggestions,
            generatedAt: new Date()
        };

        // Save to database
        await Recommendation.create(recommendation);

        return recommendation;
    } catch (error) {
        console.error('Error generating recommendations:', error);
        throw error;
    }
};

/**
 * Get latest recommendation for a user
 */
const getLatestRecommendation = async (userId) => {
    try {
        const recommendation = await Recommendation.findOne({ userId })
            .sort({ generatedAt: -1 })
            .limit(1);

        return recommendation;
    } catch (error) {
        console.error('Error fetching recommendation:', error);
        throw error;
    }
};

module.exports = {
    generateRecommendations,
    getLatestRecommendation
};
