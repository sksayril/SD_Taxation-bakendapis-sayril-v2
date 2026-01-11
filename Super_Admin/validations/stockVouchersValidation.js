const Joi = require('joi');

// Validation schema for stock voucher items
const stockVoucherItemSchema = Joi.object({
  itemCode: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Item code is required',
      'any.required': 'Item code is required'
    }),
  quantity: Joi.number()
    .required()
    .min(0.01)
    .messages({
      'number.min': 'Quantity must be greater than 0',
      'any.required': 'Quantity is required'
    }),
  rate: Joi.number()
    .required()
    .min(0)
    .messages({
      'number.min': 'Rate cannot be negative',
      'any.required': 'Rate is required'
    })
});

// Validation schema for creating a stock voucher
const createStockVoucherSchema = Joi.object({
  voucherType: Joi.string()
    .required()
    .valid('Stock Journal', 'Stock Transfer', 'Stock Issue', 'Stock Return', 'Stock Adjustment')
    .messages({
      'any.only': 'Voucher type must be one of: Stock Journal, Stock Transfer, Stock Issue, Stock Return, Stock Adjustment',
      'any.required': 'Voucher type is required'
    }),
  voucherNumber: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Voucher number is required',
      'any.required': 'Voucher number is required'
    }),
  companyId: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Company ID is required',
      'any.required': 'Company ID is required'
    }),
  date: Joi.date()
    .required()
    .messages({
      'date.base': 'Date must be a valid date',
      'any.required': 'Date is required'
    }),
  narration: Joi.string()
    .required()
    .trim()
    .max(500)
    .messages({
      'string.max': 'Narration cannot exceed 500 characters',
      'string.empty': 'Narration is required',
      'any.required': 'Narration is required'
    }),
  sourceLocation: Joi.string()
    .required()
    .trim()
    .max(100)
    .messages({
      'string.max': 'Source location cannot exceed 100 characters',
      'any.required': 'Source location is required'
    }),
  destinationLocation: Joi.string()
    .required()
    .trim()
    .max(100)
    .messages({
      'string.max': 'Destination location cannot exceed 100 characters',
      'any.required': 'Destination location is required'
    }),
  items: Joi.array()
    .items(stockVoucherItemSchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one item is required',
      'any.required': 'Items are required'
    }),
  createdBy: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Created by is required',
      'any.required': 'Created by is required'
    })
});

// Validation schema for updating a stock voucher
const updateStockVoucherSchema = Joi.object({
  voucherType: Joi.string()
    .valid('Stock Journal', 'Stock Transfer', 'Stock Issue', 'Stock Return', 'Stock Adjustment')
    .messages({
      'any.only': 'Voucher type must be one of: Stock Journal, Stock Transfer, Stock Issue, Stock Return, Stock Adjustment'
    }),
  voucherNumber: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Voucher number cannot be empty'
    }),
  date: Joi.date()
    .messages({
      'date.base': 'Date must be a valid date'
    }),
  narration: Joi.string()
    .trim()
    .max(500)
    .messages({
      'string.max': 'Narration cannot exceed 500 characters'
    }),
  sourceLocation: Joi.string()
    .trim()
    .max(100)
    .messages({
      'string.max': 'Source location cannot exceed 100 characters'
    }),
  destinationLocation: Joi.string()
    .trim()
    .max(100)
    .messages({
      'string.max': 'Destination location cannot exceed 100 characters'
    }),
  items: Joi.array()
    .items(stockVoucherItemSchema)
    .min(1)
    .messages({
      'array.min': 'At least one item is required'
    }),
  createdBy: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Created by cannot be empty'
    }),
  status: Joi.string()
    .valid('Issued', 'Returned', 'Pending', 'Cancelled')
    .messages({
      'any.only': 'Status must be one of: Issued, Returned, Pending, Cancelled'
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
  voucherType: Joi.string()
    .valid('Stock Journal', 'Stock Transfer', 'Stock Issue', 'Stock Return', 'Stock Adjustment')
    .optional(),
  status: Joi.string()
    .valid('Issued', 'Returned', 'Pending', 'Cancelled')
    .optional(),
  startDate: Joi.date()
    .optional(),
  endDate: Joi.date()
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

// Validation schema for voucher type parameter
const voucherTypeValidationSchema = Joi.object({
  voucherType: Joi.string()
    .valid('Stock Journal', 'Stock Transfer', 'Stock Issue', 'Stock Return', 'Stock Adjustment')
    .required()
    .messages({
      'any.only': 'Invalid voucher type. Must be one of: Stock Journal, Stock Transfer, Stock Issue, Stock Return, Stock Adjustment',
      'any.required': 'Voucher type parameter is required'
    })
});

// Validation schema for status parameter
const statusValidationSchema = Joi.object({
  status: Joi.string()
    .valid('Issued', 'Returned', 'Pending', 'Cancelled')
    .required()
    .messages({
      'any.only': 'Invalid status. Must be one of: Issued, Returned, Pending, Cancelled',
      'any.required': 'Status parameter is required'
    })
});

// Validation schema for status update
const statusUpdateSchema = Joi.object({
  status: Joi.string()
    .valid('Issued', 'Returned', 'Pending', 'Cancelled')
    .required()
    .messages({
      'any.only': 'Status must be one of: Issued, Returned, Pending, Cancelled',
      'any.required': 'Status is required'
    })
});

// Validation schema for return voucher creation
const returnVoucherSchema = Joi.object({
  createdBy: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Created by is required',
      'any.required': 'Created by is required'
    })
});

// Validation middleware for creating a stock voucher
const validateCreateStockVoucher = (req, res, next) => {
  const { error, value } = createStockVoucherSchema.validate(req.body, {
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

// Validation middleware for updating a stock voucher
const validateUpdateStockVoucher = (req, res, next) => {
  const { error, value } = updateStockVoucherSchema.validate(req.body, {
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

// Validation middleware for voucher type parameter
const validateVoucherType = (req, res, next) => {
  const { error, value } = voucherTypeValidationSchema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Voucher type validation error',
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

// Validation middleware for status update
const validateStatusUpdate = (req, res, next) => {
  const { error, value } = statusUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Status update validation error',
      errors: errorMessages
    });
  }

  req.body = value;
  next();
};

// Validation middleware for return voucher
const validateReturnVoucher = (req, res, next) => {
  const { error, value } = returnVoucherSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Return voucher validation error',
      errors: errorMessages
    });
  }

  req.body = value;
  next();
};

module.exports = {
  createStockVoucherSchema,
  updateStockVoucherSchema,
  queryValidationSchema,
  searchValidationSchema,
  voucherTypeValidationSchema,
  statusValidationSchema,
  statusUpdateSchema,
  returnVoucherSchema,
  validateCreateStockVoucher,
  validateUpdateStockVoucher,
  validateQuery,
  validateSearch,
  validateVoucherType,
  validateStatus,
  validateStatusUpdate,
  validateReturnVoucher
};
