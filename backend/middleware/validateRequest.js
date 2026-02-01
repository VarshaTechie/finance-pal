const { HTTP_STATUS } = require('../utils/constants');
const { isValidObjectId } = require('../utils/helpers');

/**
 * Validate required fields in request body
 */
const validateRequiredFields = (fields) => {
    return (req, res, next) => {
        const missingFields = [];

        fields.forEach(field => {
            if (!req.body[field] && req.body[field] !== 0) {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Validate ObjectId parameter
 */
const validateObjectId = (paramName = 'userId') => {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!isValidObjectId(id)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: `Invalid ${paramName} format`
            });
        }

        next();
    };
};

/**
 * Sanitize input data
 */
const sanitizeInput = (req, res, next) => {
    // Remove any potentially harmful characters
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }
    next();
};

module.exports = {
    validateRequiredFields,
    validateObjectId,
    sanitizeInput
};
