// Super_Admin/middleware/validate.js
const Joi = require('joi');

module.exports = (schema) => {
  return (req, res, next) => {
    // Ensure req.body exists
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required',
        errors: ['No request body provided']
      });
    }

    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const errors = error.details.map((d) => d.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    
    req.body = value;
    next();
  };
};
