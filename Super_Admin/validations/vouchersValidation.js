const Joi = require('joi');

// Validation schema for entry objects
const entrySchema = Joi.object({
  ledgerName: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Ledger name is required',
      'any.required': 'Ledger name is required'
    }),
  amount: Joi.number()
    .required()
    .min(0.01)
    .messages({
      'number.min': 'Amount must be greater than 0',
      'any.required': 'Amount is required'
    }),
  narration: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Narration cannot exceed 200 characters'
    })
});

// Validation schema for creating a voucher
const createVoucherSchema = Joi.object({
  companyId: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Company ID is required',
      'any.required': 'Company ID is required'
    }),
  voucherType: Joi.string()
    .required()
    .valid('Payment', 'Receipt', 'Journal', 'Sales', 'Purchase', 'Contra', 'Stock Journal')
    .messages({
      'any.only': 'Voucher type must be one of: Payment, Receipt, Journal, Sales, Purchase, Contra, Stock Journal',
      'any.required': 'Voucher type is required'
    }),
  voucherNumber: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Voucher number is required',
      'any.required': 'Voucher number is required'
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
      'string.empty': 'Narration is required',
      'string.max': 'Narration cannot exceed 500 characters',
      'any.required': 'Narration is required'
    }),
  debitEntries: Joi.array()
    .items(entrySchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one debit entry is required',
      'any.required': 'Debit entries are required'
    }),
  creditEntries: Joi.array()
    .items(entrySchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one credit entry is required',
      'any.required': 'Credit entries are required'
    }),
  approvedBy: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Approved by is required',
      'any.required': 'Approved by is required'
    })
});

// Validation schema for updating a voucher
const updateVoucherSchema = Joi.object({
  voucherType: Joi.string()
    .valid('Payment', 'Receipt', 'Journal', 'Sales', 'Purchase', 'Contra', 'Stock Journal')
    .messages({
      'any.only': 'Voucher type must be one of: Payment, Receipt, Journal, Sales, Purchase, Contra, Stock Journal'
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
  debitEntries: Joi.array()
    .items(entrySchema)
    .min(1)
    .messages({
      'array.min': 'At least one debit entry is required'
    }),
  creditEntries: Joi.array()
    .items(entrySchema)
    .min(1)
    .messages({
      'array.min': 'At least one credit entry is required'
    }),
  approvedBy: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Approved by cannot be empty'
    }),
  status: Joi.string()
    .valid('Draft', 'Approved', 'Rejected')
    .messages({
      'any.only': 'Status must be one of: Draft, Approved, Rejected'
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
    .valid('Payment', 'Receipt', 'Journal', 'Sales', 'Purchase', 'Contra', 'Stock Journal')
    .optional(),
  status: Joi.string()
    .valid('Draft', 'Approved', 'Rejected')
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

// Validation schema for date range parameters
const dateRangeValidationSchema = Joi.object({
  companyId: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Company ID is required',
      'any.required': 'Company ID is required'
    }),
  startDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),
  endDate: Joi.date()
    .required()
    .messages({
      'date.base': 'End date must be a valid date',
      'any.required': 'End date is required'
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
    .valid('Payment', 'Receipt', 'Journal', 'Sales', 'Purchase', 'Contra', 'Stock Journal')
    .required()
    .messages({
      'any.only': 'Invalid voucher type. Must be one of: Payment, Receipt, Journal, Sales, Purchase, Contra, Stock Journal',
      'any.required': 'Voucher type parameter is required'
    })
});

// Validation schema for status update
const statusUpdateSchema = Joi.object({
  status: Joi.string()
    .valid('Approved', 'Rejected')
    .required()
    .messages({
      'any.only': 'Status must be either Approved or Rejected',
      'any.required': 'Status is required'
    }),
  approvedBy: Joi.string()
    .when('status', {
      is: 'Approved',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .trim()
    .messages({
      'any.required': 'Approved by is required when status is Approved',
      'string.empty': 'Approved by cannot be empty'
    })
});

// Validation middleware for creating a voucher
const validateCreateVoucher = (req, res, next) => {
  const { error, value } = createVoucherSchema.validate(req.body, {
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

// Validation middleware for updating a voucher
const validateUpdateVoucher = (req, res, next) => {
  const { error, value } = updateVoucherSchema.validate(req.body, {
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

// Validation middleware for date range parameters
const validateDateRange = (req, res, next) => {
  const { error, value } = dateRangeValidationSchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Date range validation error',
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

module.exports = {
  createVoucherSchema,
  updateVoucherSchema,
  queryValidationSchema,
  searchValidationSchema,
  dateRangeValidationSchema,
  voucherTypeValidationSchema,
  statusUpdateSchema,
  validateCreateVoucher,
  validateUpdateVoucher,
  validateQuery,
  validateSearch,
  validateDateRange,
  validateVoucherType,
  validateStatusUpdate
};
