const Joi = require('joi');

// Create Department Schema
exports.createDepartmentSchema = Joi.object({
  department_name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Department name is required',
    'string.min': 'Department name must be at least 2 characters',
    'string.max': 'Department name must not exceed 100 characters'
  }),
  description: Joi.string().max(500).optional().allow('', null).messages({
    'string.max': 'Description must not exceed 500 characters'
  }),
  status: Joi.string().valid('active', 'inactive').optional().messages({
    'any.only': 'Status must be one of: active, inactive'
  })
});

// Update Department Schema
exports.updateDepartmentSchema = Joi.object({
  department_name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Department name must be at least 2 characters',
    'string.max': 'Department name must not exceed 100 characters'
  }),
  description: Joi.string().max(500).optional().allow('', null).messages({
    'string.max': 'Description must not exceed 500 characters'
  }),
  status: Joi.string().valid('active', 'inactive').optional().messages({
    'any.only': 'Status must be one of: active, inactive'
  })
});
