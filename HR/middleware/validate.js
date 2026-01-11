// HR(OR)/middleware/validate.js
const Joi = require('joi');

module.exports = (schema) => {
  return (req, res, next) => {
    // Check if schema is for route params (has 'id' or 'companyId' as required fields)
    const schemaKeys = Object.keys(schema.describe().keys || {});
    const isRouteParamSchema = schemaKeys.some(key => ['id', 'companyId', 'employeeId', 'payslipId'].includes(key)) && 
                               schemaKeys.length <= 2; // Route param schemas typically have 1-2 keys
    
    // For route parameter validation
    if (isRouteParamSchema && req.params) {
      const { error, value } = schema.validate(req.params, { abortEarly: false, stripUnknown: true });
      if (error) {
        const errors = error.details.map((d) => d.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
      req.params = value;
      next();
      return;
    }

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

    // For POST/PUT/PATCH requests, validate request body
    // Allow empty body for some endpoints (like approve)
    const { error, value } = schema.validate(req.body || {}, { abortEarly: false, stripUnknown: true });
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
