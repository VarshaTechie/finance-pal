/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

/**
 * Format currency
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

/**
 * Calculate percentage
 */
const calculatePercentage = (part, whole) => {
    if (whole === 0) return 0;
    return ((part / whole) * 100).toFixed(2);
};

/**
 * Aggregate expenses by category
 */
const aggregateByCategory = (expenses) => {
    const categoryTotals = {};

    expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });

    return categoryTotals;
};

/**
 * Get date range for current month
 */
const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return { firstDay, lastDay };
};

/**
 * Validate MongoDB ObjectId
 */
/**
 * Get date range for previous month
 */
const getPreviousMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);

    return { firstDay, lastDay };
};

const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
    formatDate,
    formatCurrency,
    calculatePercentage,
    aggregateByCategory,
    getCurrentMonthRange,
    getPreviousMonthRange,
    isValidObjectId
};
