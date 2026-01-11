const Joi = require('joi');

// Validation schema for creating a ledger
const createLedgerSchema = Joi.object({
  companyId: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Company ID is required',
      'any.required': 'Company ID is required'
    }),
  ledgerName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.min': 'Ledger name must be at least 2 characters',
      'string.max': 'Ledger name cannot exceed 100 characters',
      'string.empty': 'Ledger name is required',
      'any.required': 'Ledger name is required'
    }),
  underGroup: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Under group is required',
      'any.required': 'Under group is required'
    }),
  openingBalance: Joi.number()
    .default(0)
    .messages({
      'number.base': 'Opening balance must be a number'
    }),
  ledgerType: Joi.string()
    .valid('Cash', 'Bank', 'Expense', 'Income', 'Asset', 'Liability', 'Customer', 'Supplier')
    .default('Cash')
    .messages({
      'any.only': 'Ledger type must be one of: Cash, Bank, Expense, Income, Asset, Liability, Customer, Supplier'
    }),
  bankDetails: Joi.object({
    accountNumber: Joi.string()
      .trim()
      .max(20)
      .messages({
        'string.max': 'Account number cannot exceed 20 characters'
      }),
    ifsc: Joi.string()
      .trim()
      .uppercase()
      .max(11)
      .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      .messages({
        'string.pattern.base': 'Invalid IFSC code format'
      })
  }).optional()
});

// Validation schema for updating a ledger
const updateLedgerSchema = Joi.object({
  ledgerName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.min': 'Ledger name must be at least 2 characters',
      'string.max': 'Ledger name cannot exceed 100 characters'
    }),
  underGroup: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Under group cannot be empty'
    }),
  openingBalance: Joi.number()
    .messages({
      'number.base': 'Opening balance must be a number'
    }),
  ledgerType: Joi.string()
    .valid('Cash', 'Bank', 'Expense', 'Income', 'Asset', 'Liability', 'Customer', 'Supplier')
    .messages({
      'any.only': 'Ledger type must be one of: Cash, Bank, Expense, Income, Asset, Liability, Customer, Supplier'
    }),
  bankDetails: Joi.object({
    accountNumber: Joi.string()
      .trim()
      .max(20)
      .messages({
        'string.max': 'Account number cannot exceed 20 characters'
      }),
    ifsc: Joi.string()
      .trim()
      .uppercase()
      .max(11)
      .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      .messages({
        'string.pattern.base': 'Invalid IFSC code format'
      })
  }).optional()
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
  underGroup: Joi.string()
    .trim()
    .optional(),
  ledgerType: Joi.string()
    .valid('Cash', 'Bank', 'Expense', 'Income', 'Asset', 'Liability', 'Customer', 'Supplier')
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

// Validation schema for group parameter
const groupValidationSchema = Joi.object({
  groupName: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Group name is required',
      'any.required': 'Group name is required'
    })
});

// Validation schema for ledger type parameter
const ledgerTypeValidationSchema = Joi.object({
  ledgerType: Joi.string()
    .valid('Cash', 'Bank', 'Expense', 'Income', 'Asset', 'Liability', 'Customer', 'Supplier')
    .required()
    .messages({
      'any.only': 'Invalid ledger type. Must be one of: Cash, Bank, Expense, Income, Asset, Liability, Customer, Supplier',
      'any.required': 'Ledger type parameter is required'
    })
});

// Validation middleware for creating a ledger
const validateCreateLedger = (req, res, next) => {
  const { error, value } = createLedgerSchema.validate(req.body, {
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

// Validation middleware for updating a ledger
const validateUpdateLedger = (req, res, next) => {
  const { error, value } = updateLedgerSchema.validate(req.body, {
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

// Validation middleware for group parameter
const validateGroup = (req, res, next) => {
  const { error, value } = groupValidationSchema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Group validation error',
      errors: errorMessages
    });
  }

  req.params = value;
  next();
};

// Validation middleware for ledger type parameter
const validateLedgerType = (req, res, next) => {
  const { error, value } = ledgerTypeValidationSchema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Ledger type validation error',
      errors: errorMessages
    });
  }

  req.params = value;
  next();
};

module.exports = {
  createLedgerSchema,
  updateLedgerSchema,
  queryValidationSchema,
  searchValidationSchema,
  groupValidationSchema,
  ledgerTypeValidationSchema,
  validateCreateLedger,
  validateUpdateLedger,
  validateQuery,
  validateSearch,
  validateGroup,
  validateLedgerType
};
