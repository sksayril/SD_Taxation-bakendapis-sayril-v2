const Joi = require('joi');

// Create Subscription Plan Schema
exports.createPlanSchema = Joi.object({
  planName: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Plan name is required',
    'string.min': 'Plan name must be at least 2 characters',
    'string.max': 'Plan name must not exceed 100 characters'
  }),
  description: Joi.string().max(500).allow('', null).messages({
    'string.max': 'Description must not exceed 500 characters'
  }),
  price: Joi.number().min(0).required().messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price must be 0 or greater',
    'any.required': 'Price is required'
  }),
  currency: Joi.string().length(3).uppercase().default('INR').messages({
    'string.length': 'Currency must be 3 characters (e.g., INR, USD)'
  }),
  duration: Joi.number().integer().min(1).required().messages({
    'number.base': 'Duration must be a number',
    'number.min': 'Duration must be at least 1 month',
    'any.required': 'Duration is required'
  }),
  features: Joi.array().items(Joi.string()).default([]).messages({
    'array.base': 'Features must be an array'
  }),
  maxEmployees: Joi.number().integer().min(1).allow(null).messages({
    'number.base': 'Max employees must be a number',
    'number.min': 'Max employees must be at least 1'
  }),
  maxAdmins: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Max admins must be a number',
    'number.min': 'Max admins must be at least 1'
  }),
  isActive: Joi.boolean().default(true)
});

// Update Subscription Plan Schema
exports.updatePlanSchema = Joi.object({
  planName: Joi.string().min(2).max(100).messages({
    'string.min': 'Plan name must be at least 2 characters',
    'string.max': 'Plan name must not exceed 100 characters'
  }),
  description: Joi.string().max(500).allow('', null).messages({
    'string.max': 'Description must not exceed 500 characters'
  }),
  price: Joi.number().min(0).messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price must be 0 or greater'
  }),
  currency: Joi.string().length(3).uppercase().messages({
    'string.length': 'Currency must be 3 characters (e.g., INR, USD)'
  }),
  duration: Joi.number().integer().min(1).messages({
    'number.base': 'Duration must be a number',
    'number.min': 'Duration must be at least 1 month'
  }),
  features: Joi.array().items(Joi.string()).messages({
    'array.base': 'Features must be an array'
  }),
  maxEmployees: Joi.number().integer().min(1).allow(null).messages({
    'number.base': 'Max employees must be a number',
    'number.min': 'Max employees must be at least 1'
  }),
  maxAdmins: Joi.number().integer().min(1).messages({
    'number.base': 'Max admins must be a number',
    'number.min': 'Max admins must be at least 1'
  }),
  isActive: Joi.boolean()
});

// Assign Subscription to Company Schema
exports.assignSubscriptionSchema = Joi.object({
  company: Joi.string().required().messages({
    'string.empty': 'Company ID is required',
    'any.required': 'Company ID is required'
  }),
  plan: Joi.string().required().messages({
    'string.empty': 'Plan ID is required',
    'any.required': 'Plan ID is required'
  }),
  startDate: Joi.date().default(Date.now).messages({
    'date.base': 'Start date must be a valid date'
  }),
  endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
    'date.base': 'End date must be a valid date',
    'date.greater': 'End date must be after start date',
    'any.required': 'End date is required'
  }),
  autoRenew: Joi.boolean().default(false),
  notes: Joi.string().max(500).allow('', null).messages({
    'string.max': 'Notes must not exceed 500 characters'
  })
});

// Update Company Subscription Schema
exports.updateSubscriptionSchema = Joi.object({
  plan: Joi.string().messages({
    'string.empty': 'Plan ID must be a valid string'
  }),
  startDate: Joi.date().messages({
    'date.base': 'Start date must be a valid date'
  }),
  endDate: Joi.date().messages({
    'date.base': 'End date must be a valid date'
  }),
  status: Joi.string().valid('active', 'expired', 'cancelled', 'suspended').messages({
    'any.only': 'Status must be one of: active, expired, cancelled, suspended'
  }),
  autoRenew: Joi.boolean(),
  notes: Joi.string().max(500).allow('', null).messages({
    'string.max': 'Notes must not exceed 500 characters'
  })
});

