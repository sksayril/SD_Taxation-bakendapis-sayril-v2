const Joi = require('joi');

// Validation schema for creating a stock item
const createStockItemSchema = Joi.object({
  companyId: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Company ID is required',
      'any.required': 'Company ID is required'
    }),
  stockGroup: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Stock group is required',
      'any.required': 'Stock group is required'
    }),
  itemCode: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Item code is required',
      'any.required': 'Item code is required'
    }),
  itemName: Joi.string()
    .min(2)
    .max(200)
    .required()
    .trim()
    .messages({
      'string.min': 'Item name must be at least 2 characters',
      'string.max': 'Item name cannot exceed 200 characters',
      'string.empty': 'Item name is required',
      'any.required': 'Item name is required'
    }),
  unit: Joi.string()
    .required()
    .valid('Nos', 'Kg', 'Ltr', 'Mtr', 'Box', 'Set', 'Pair', 'Dozen', 'Gram', 'Ton')
    .messages({
      'any.only': 'Unit must be one of: Nos, Kg, Ltr, Mtr, Box, Set, Pair, Dozen, Gram, Ton',
      'any.required': 'Unit is required'
    }),
  quantity: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Quantity cannot be negative',
      'any.required': 'Quantity is required'
    }),
  rate: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Rate cannot be negative',
      'any.required': 'Rate is required'
    }),
  batchNo: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Batch number cannot exceed 50 characters'
    }),
  location: Joi.string()
    .required()
    .trim()
    .max(100)
    .messages({
      'string.max': 'Location cannot exceed 100 characters',
      'any.required': 'Location is required'
    }),
  status: Joi.string()
    .valid('Available', 'Issued', 'Returned', 'Damaged', 'Lost')
    .default('Available')
    .messages({
      'any.only': 'Status must be one of: Available, Issued, Returned, Damaged, Lost'
    })
});

// Validation schema for updating a stock item
const updateStockItemSchema = Joi.object({
  stockGroup: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Stock group cannot be empty'
    }),
  itemCode: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Item code cannot be empty'
    }),
  itemName: Joi.string()
    .min(2)
    .max(200)
    .trim()
    .messages({
      'string.min': 'Item name must be at least 2 characters',
      'string.max': 'Item name cannot exceed 200 characters'
    }),
  unit: Joi.string()
    .valid('Nos', 'Kg', 'Ltr', 'Mtr', 'Box', 'Set', 'Pair', 'Dozen', 'Gram', 'Ton')
    .messages({
      'any.only': 'Unit must be one of: Nos, Kg, Ltr, Mtr, Box, Set, Pair, Dozen, Gram, Ton'
    }),
  quantity: Joi.number()
    .min(0)
    .messages({
      'number.min': 'Quantity cannot be negative'
    }),
  rate: Joi.number()
    .min(0)
    .messages({
      'number.min': 'Rate cannot be negative'
    }),
  batchNo: Joi.string()
    .trim()
    .max(50)
    .messages({
      'string.max': 'Batch number cannot exceed 50 characters'
    }),
  location: Joi.string()
    .trim()
    .max(100)
    .messages({
      'string.max': 'Location cannot exceed 100 characters'
    }),
  status: Joi.string()
    .valid('Available', 'Issued', 'Returned', 'Damaged', 'Lost')
    .messages({
      'any.only': 'Status must be one of: Available, Issued, Returned, Damaged, Lost'
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
  stockGroup: Joi.string()
    .trim()
    .optional(),
  status: Joi.string()
    .valid('Available', 'Issued', 'Returned', 'Damaged', 'Lost')
    .optional(),
  location: Joi.string()
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

// Validation schema for stock group parameter
const stockGroupValidationSchema = Joi.object({
  stockGroup: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Stock group is required',
      'any.required': 'Stock group is required'
    })
});

// Validation schema for status parameter
const statusValidationSchema = Joi.object({
  status: Joi.string()
    .valid('Available', 'Issued', 'Returned', 'Damaged', 'Lost')
    .required()
    .messages({
      'any.only': 'Invalid status. Must be one of: Available, Issued, Returned, Damaged, Lost',
      'any.required': 'Status parameter is required'
    })
});

// Validation schema for quantity update
const quantityUpdateSchema = Joi.object({
  quantity: Joi.number()
    .required()
    .min(0)
    .messages({
      'number.min': 'Quantity cannot be negative',
      'any.required': 'Quantity is required'
    }),
  operation: Joi.string()
    .valid('set', 'add', 'subtract')
    .default('set')
    .messages({
      'any.only': 'Operation must be one of: set, add, subtract'
    })
});

// Validation middleware for creating a stock item
const validateCreateStockItem = (req, res, next) => {
  const { error, value } = createStockItemSchema.validate(req.body, {
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

// Validation middleware for updating a stock item
const validateUpdateStockItem = (req, res, next) => {
  const { error, value } = updateStockItemSchema.validate(req.body, {
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

// Validation middleware for stock group parameter
const validateStockGroup = (req, res, next) => {
  const { error, value } = stockGroupValidationSchema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Stock group validation error',
      errors: errorMessages
    });
  }

  req.params = value;
  next();
};

// Validation middleware for status parameter
const validateStatus = (req, res, next) => {
  const { error, value } = statusValidationSchema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Status validation error',
      errors: errorMessages
    });
  }

  req.params = value;
  next();
};

// Validation middleware for quantity update
const validateQuantityUpdate = (req, res, next) => {
  const { error, value } = quantityUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Quantity update validation error',
      errors: errorMessages
    });
  }

  req.body = value;
  next();
};

module.exports = {
  createStockItemSchema,
  updateStockItemSchema,
  queryValidationSchema,
  searchValidationSchema,
  stockGroupValidationSchema,
  statusValidationSchema,
  quantityUpdateSchema,
  validateCreateStockItem,
  validateUpdateStockItem,
  validateQuery,
  validateSearch,
  validateStockGroup,
  validateStatus,
  validateQuantityUpdate
};
