const { HTTP_STATUS } = require('../utils/constants');
const { fetchFinancialNews } = require('../services/newsService');

/**
 * Get financial news
 * GET /api/news
 */
const getFinancialNews = async (req, res, next) => {
    try {
        const newsData = await fetchFinancialNews();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            ...newsData
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFinancialNews
};
