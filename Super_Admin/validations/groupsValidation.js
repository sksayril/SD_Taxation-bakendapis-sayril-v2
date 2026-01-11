const Joi = require('joi');

// Validation schema for creating a group
const createGroupSchema = Joi.object({
  companyId: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Company ID is required',
      'any.required': 'Company ID is required'
    }),
  groupName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.min': 'Group name must be at least 2 characters',
      'string.max': 'Group name cannot exceed 100 characters',
      'string.empty': 'Group name is required',
      'any.required': 'Group name is required'
    }),
  underGroupId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'underGroupId must be a valid ObjectId'
    }),
  nature: Joi.string()
    .valid('Assets', 'Liabilities', 'Income', 'Expenses')
    .required()
    .messages({
      'any.only': 'Nature must be one of: Assets, Liabilities, Income, Expenses',
      'any.required': 'Nature is required'
    }),
  isPrimary: Joi.boolean()
    .default(false)
});

// Validation schema for updating a group
const updateGroupSchema = Joi.object({
  groupName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.min': 'Group name must be at least 2 characters',
      'string.max': 'Group name cannot exceed 100 characters'
    }),
  underGroupId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'underGroupId must be a valid ObjectId'
    }),
  nature: Joi.string()
    .valid('Assets', 'Liabilities', 'Income', 'Expenses')
    .messages({
      'any.only': 'Nature must be one of: Assets, Liabilities, Income, Expenses'
    }),
  isPrimary: Joi.boolean()
});

// Validation schema for query parameters
const queryValidationSchema = Joi.object({
  companyId: Joi.string()
    .trim()
    .optional(),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  search: Joi.string()
    .trim()
    .allow('')
    .optional(),
  nature: Joi.string()
    .valid('Assets', 'Liabilities', 'Income', 'Expenses')
    .optional(),
  isPrimary: Joi.boolean()
    .optional()
});

// Validation schema for search parameters
const searchValidationSchema = Joi.object({
  companyId: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Company ID is required',
      'any.required': 'Company ID is required'
    }),
  search: Joi.string()
    .required()
    .trim()
    .min(1)
    .messages({
      'string.empty': 'Search term is required',
      'string.min': 'Search term must be at least 1 character',
      'any.required': 'Search term is required'
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
});

// Validation schema for nature parameter
const natureValidationSchema = Joi.object({
  nature: Joi.string()
    .valid('Assets', 'Liabilities', 'Income', 'Expenses')
    .required()
    .messages({
      'any.only': 'Invalid nature. Must be one of: Assets, Liabilities, Income, Expenses',
      'any.required': 'Nature parameter is required'
    })
});

// Validation middleware for creating a group
const validateCreateGroup = (req, res, next) => {
  const { error, value } = createGroupSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errorMessages
    });
  }

  req.body = value;
  next();
};

// Validation middleware for updating a group
const validateUpdateGroup = (req, res, next) => {
  const { error, value } = updateGroupSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errorMessages
    });
  }

  req.body = value;
  next();
};

// Validation middleware for query parameters
const validateQuery = (req, res, next) => {
  const { error, value } = queryValidationSchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Query validation error',
      errors: errorMessages
    });
  }

  req.query = value;
  next();
};

// Validation middleware for search parameters
const validateSearch = (req, res, next) => {
  const { error, value } = searchValidationSchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Search validation error',
      errors: errorMessages
    });
  }

  req.query = value;
  next();
};

// Validation middleware for nature parameter
const validateNature = (req, res, next) => {
  const { error, value } = natureValidationSchema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Nature validation error',
      errors: errorMessages
    });
  }

  req.params = value;
  next();
};

module.exports = {
  createGroupSchema,
  updateGroupSchema,
  queryValidationSchema,
  searchValidationSchema,
  natureValidationSchema,
  validateCreateGroup,
  validateUpdateGroup,
  validateQuery,
  validateSearch,
  validateNature
};
