const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    // We'll store the month as a Date object set to the 1st of the month (e.g., 2026-01-01)
    month: {
        type: Date,
        required: [true, 'Month is required']
    },
    source: {
        type: String,
        default: 'Salary'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure only one income record per user per month
incomeSchema.index({ userId: 1, month: 1 }, { unique: true });

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;
