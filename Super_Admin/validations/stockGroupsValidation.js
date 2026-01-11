const Joi = require('joi');

// Validation schema for creating a stock group
const createStockGroupSchema = Joi.object({
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
  parentGroup: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Parent group is required',
      'any.required': 'Parent group is required'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

// Validation schema for updating a stock group
const updateStockGroupSchema = Joi.object({
  groupName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.min': 'Group name must be at least 2 characters',
      'string.max': 'Group name cannot exceed 100 characters'
    }),
  parentGroup: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Parent group cannot be empty'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
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
  parentGroup: Joi.string()
    .trim()
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

// Validation schema for parent group parameter
const parentGroupValidationSchema = Joi.object({
  parentGroup: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Parent group is required',
      'any.required': 'Parent group is required'
    })
});

// Validation middleware for creating a stock group
const validateCreateStockGroup = (req, res, next) => {
  const { error, value } = createStockGroupSchema.validate(req.body, {
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

// Validation middleware for updating a stock group
const validateUpdateStockGroup = (req, res, next) => {
  const { error, value } = updateStockGroupSchema.validate(req.body, {
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

// Validation middleware for parent group parameter
const validateParentGroup = (req, res, next) => {
  const { error, value } = parentGroupValidationSchema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Parent group validation error',
      errors: errorMessages
    });
  }

  req.params = value;
  next();
};

module.exports = {
  createStockGroupSchema,
  updateStockGroupSchema,
  queryValidationSchema,
  searchValidationSchema,
  parentGroupValidationSchema,
  validateCreateStockGroup,
  validateUpdateStockGroup,
  validateQuery,
  validateSearch,
  validateParentGroup
};
