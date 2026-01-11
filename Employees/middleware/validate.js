// Employees/middleware/validate.js
const Joi = require('joi');

module.exports = (schema) => {
  return (req, res, next) => {
    // For GET requests, validate query parameters
    if (req.method === 'GET') {
      const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
      if (error) {
        const errors = error.details.map((d) => d.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
      req.query = value;
      next();
      return;
    }

    // For other methods, validate request body
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
