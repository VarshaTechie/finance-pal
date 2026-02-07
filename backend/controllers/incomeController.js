const User = require('../models/User');
const Income = require('../models/Income');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Create or update user's monthly income for a specific month
 * POST /api/income
 */
const createOrUpdateIncome = async (req, res, next) => {
    try {
        const { userId, name, email, monthlyIncome, month, year, source } = req.body;
        console.log('Incoming Income Request:', JSON.stringify(req.body));
        console.log('Checking Income Save params:', { month, year, typeM: typeof month, source });

        // Ensure we have a valid user first
        let user;
        if (userId) {
            user = await User.findById(userId);
            // Update default income as well if provided, for fallback
            if (user && monthlyIncome) {
                user.monthlyIncome = monthlyIncome;
                await user.save();
            }
        } else {
            // Create new user flow (legacy/initial setup)
            user = await User.findOneAndUpdate(
                { email },
                { name, email, monthlyIncome },
                { new: true, upsert: true, runValidators: true }
            );
        }

        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        // If specific month/year is provided, save to Income history
        // We keep ONE income record per user+month and ACCUMULATE the amount,
        // so multiple income entries for the same month are added together.
        let incomeDoc = null;
        if (month !== undefined && year !== undefined) {
            const monthDate = new Date(year, month, 1); // 1st of the month
            const incomeSource = source || 'Salary';

            incomeDoc = await Income.findOneAndUpdate(
                { userId: user._id, month: monthDate },
                {
                    $inc: { amount: monthlyIncome },
                    $set: { source: incomeSource }
                },
                { new: true, upsert: true, runValidators: true }
            );
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Income updated successfully',
            data: {
                ...user.toObject(),
                monthlyIncome: incomeDoc ? incomeDoc.amount : user.monthlyIncome
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's income information for a specific month
 * GET /api/income/:userId
 * Query params: month, year
 */
const getIncome = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { month, year } = req.query;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        let currentIncome = user.monthlyIncome;

        // Try to fetch specific income for the month
        if (month !== undefined && year !== undefined) {
            const monthDate = new Date(year, month, 1);
            const incomeDoc = await Income.findOne({ userId, month: monthDate });
            if (incomeDoc) {
                currentIncome = incomeDoc.amount;
            }
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                ...user.toObject(),
                monthlyIncome: currentIncome
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrUpdateIncome,
    getIncome
};
