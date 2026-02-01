const { HTTP_STATUS } = require('../utils/constants');
const { generateRecommendations } = require('../services/recommendationService');

/**
 * Get savings recommendations for a user
 * GET /api/recommendations/:userId
 */
const getRecommendations = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Generate fresh recommendations
        const recommendations = await generateRecommendations(userId);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }
        next(error);
    }
};

module.exports = {
    getRecommendations
};
