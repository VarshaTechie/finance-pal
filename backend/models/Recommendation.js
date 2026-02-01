const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recommendedSavings: {
        type: Number,
        required: true,
        min: 0
    },
    totalExpenses: {
        type: Number,
        required: true,
        min: 0
    },
    expenseToIncomeRatio: {
        type: Number,
        required: true,
        min: 0
    },
    categorySuggestions: {
        type: Map,
        of: new mongoose.Schema({
            currentSpending: Number,
            recommendedSpending: Number,
            potentialSavings: Number,
            percentageOfIncome: Number
        }, { _id: false })
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for fetching latest recommendations
recommendationSchema.index({ userId: 1, generatedAt: -1 });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;
