const Joi = require('joi');

/**
 * Validation schemas for payroll endpoints
 */

// POST /api/payroll/run
const runPayrollSchema = Joi.object({
  companyId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Company ID is required',
      'string.pattern.base': 'Company ID must be a valid MongoDB ObjectId'
    }),
  month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required()
    .messages({
      'number.base': 'Month must be a number',
      'number.min': 'Month must be between 1 and 12',
      'number.max': 'Month must be between 1 and 12',
      'any.required': 'Month is required'
    }),
  year: Joi.number()
    .integer()
    .min(2000)
    .max(2100)
    .required()
    .messages({
      'number.base': 'Year must be a number',
      'number.min': 'Year must be a valid year',
      'number.max': 'Year must be a valid year',
      'any.required': 'Year is required'
    }),
  workingDays: Joi.number()
    .integer()
    .min(1)
    .max(31)
    .default(26)
    .messages({
      'number.base': 'Working days must be a number',
      'number.min': 'Working days must be at least 1',
      'number.max': 'Working days cannot exceed 31'
    }),
  employees: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      'array.base': 'Employees must be an array',
      'string.pattern.base': 'Each employee ID must be a valid MongoDB ObjectId'
    }),
  force: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Force must be a boolean'
    })
});

// GET /api/payroll
const listPayrollSchema = Joi.object({
  companyId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Company ID is required',
      'string.pattern.base': 'Company ID must be a valid MongoDB ObjectId'
    }),
  month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .optional()
    .messages({
      'number.base': 'Month must be a number',
      'number.min': 'Month must be between 1 and 12',
      'number.max': 'Month must be between 1 and 12'
    }),
  year: Joi.number()
    .integer()
    .min(2000)
    .max(2100)
    .optional()
    .messages({
      'number.base': 'Year must be a number',
      'number.min': 'Year must be a valid year',
      'number.max': 'Year must be a valid year'
    }),
  status: Joi.string()
    .valid('draft', 'approved', 'paid')
    .optional()
    .messages({
      'any.only': 'Status must be one of: draft, approved, paid'
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

// GET /api/payslip/:employeeId - validates query params only (employeeId is in route params)
const getPayslipQuerySchema = Joi.object({
  month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required()
    .messages({
      'number.base': 'Month must be a number',
      'number.min': 'Month must be between 1 and 12',
      'number.max': 'Month must be between 1 and 12',
      'any.required': 'Month is required'
    }),
  year: Joi.number()
    .integer()
    .min(2000)
    .max(2100)
    .required()
    .messages({
      'number.base': 'Year must be a number',
      'number.min': 'Year must be a valid year',
      'number.max': 'Year must be a valid year',
      'any.required': 'Year is required'
    })
});

// For route param validation
const getPayslipSchema = Joi.object({
  employeeId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Employee ID is required',
      'string.pattern.base': 'Employee ID must be a valid MongoDB ObjectId'
    })
});

// POST /api/payroll/:payslipId/approve - validates route params only (no body)
const approvePayslipSchema = Joi.object({
  payslipId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Payslip ID is required',
      'string.pattern.base': 'Payslip ID must be a valid MongoDB ObjectId'
    })
}).unknown(true); // Allow empty body

// POST /api/payroll/:payslipId/pay - validates body (payslipId is in route params)
const payPayslipBodySchema = Joi.object({
  paymentRef: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Payment reference cannot exceed 200 characters'
    }),
  bankLedgerId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Bank ledger ID must be a valid MongoDB ObjectId'
    })
});

// For route param validation
const payPayslipSchema = Joi.object({
  payslipId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Payslip ID is required',
      'string.pattern.base': 'Payslip ID must be a valid MongoDB ObjectId'
    })
});

// GET /api/payroll/bank-export
const bankExportSchema = Joi.object({
  companyId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Company ID is required',
      'string.pattern.base': 'Company ID must be a valid MongoDB ObjectId'
    }),
  month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required()
    .messages({
      'number.base': 'Month must be a number',
      'number.min': 'Month must be between 1 and 12',
      'number.max': 'Month must be between 1 and 12',
      'any.required': 'Month is required'
    }),
  year: Joi.number()
    .integer()
    .min(2000)
    .max(2100)
    .required()
    .messages({
      'number.base': 'Year must be a number',
      'number.min': 'Year must be a valid year',
      'number.max': 'Year must be a valid year',
      'any.required': 'Year is required'
    }),
  format: Joi.string()
    .valid('csv')
    .default('csv')
    .messages({
      'any.only': 'Format must be csv'
    })
});

// POST /api/payslip/:payslipId/generate-pdf - validates route params only (no body)
const generatePdfSchema = Joi.object({
  payslipId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Payslip ID is required',
      'string.pattern.base': 'Payslip ID must be a valid MongoDB ObjectId'
    })
}).unknown(true); // Allow empty body

// POST /api/payslip/:payslipId/email - validates route params only (no body)
const emailPayslipSchema = Joi.object({
  payslipId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Payslip ID is required',
      'string.pattern.base': 'Payslip ID must be a valid MongoDB ObjectId'
    })
}).unknown(true); // Allow empty body

// Salary Structure Validation Schemas

// Component schema for salary structure
const componentSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .max(100)
    .messages({
      'string.empty': 'Component name is required',
      'string.max': 'Component name cannot exceed 100 characters',
      'any.required': 'Component name is required'
    }),
  type: Joi.string()
    .valid('earning', 'deduction')
    .required()
    .messages({
      'any.only': 'Component type must be either "earning" or "deduction"',
      'any.required': 'Component type is required'
    }),
  kind: Joi.string()
    .valid('fixed', 'percent')
    .required()
    .messages({
      'any.only': 'Component kind must be either "fixed" or "percent"',
      'any.required': 'Component kind is required'
    }),
  value: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Component value must be a number',
      'number.min': 'Component value cannot be negative',
      'any.required': 'Component value is required'
    })
});

// POST /api/payroll/salary-structure
const createSalaryStructureSchema = Joi.object({
  companyId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Company ID is required',
      'string.pattern.base': 'Company ID must be a valid MongoDB ObjectId',
      'any.required': 'Company ID is required'
    }),
  name: Joi.string()
    .trim()
    .required()
    .max(200)
    .messages({
      'string.empty': 'Salary structure name is required',
      'string.max': 'Name cannot exceed 200 characters',
      'any.required': 'Salary structure name is required'
    }),
  baseForPercent: Joi.string()
    .valid('CTC', 'Basic')
    .default('CTC')
    .messages({
      'any.only': 'baseForPercent must be either "CTC" or "Basic"'
    }),
  components: Joi.array()
    .items(componentSchema)
    .min(1)
    .required()
    .messages({
      'array.base': 'Components must be an array',
      'array.min': 'At least one component is required',
      'any.required': 'Components are required'
    }),
  isDefault: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'isDefault must be a boolean'
    })
});

// GET /api/payroll/salary-structure
const listSalaryStructuresSchema = Joi.object({
  companyId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Company ID is required',
      'string.pattern.base': 'Company ID must be a valid MongoDB ObjectId',
      'any.required': 'Company ID is required'
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

// PUT /api/payroll/salary-structure/:id
const updateSalaryStructureSchema = Joi.object({
  name: Joi.string()
    .trim()
    .max(200)
    .messages({
      'string.max': 'Name cannot exceed 200 characters'
    }),
  baseForPercent: Joi.string()
    .valid('CTC', 'Basic')
    .messages({
      'any.only': 'baseForPercent must be either "CTC" or "Basic"'
    }),
  components: Joi.array()
    .items(componentSchema)
    .min(1)
    .messages({
      'array.base': 'Components must be an array',
      'array.min': 'At least one component is required'
    }),
  isDefault: Joi.boolean()
    .messages({
      'boolean.base': 'isDefault must be a boolean'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Route param validation for salary structure ID
const salaryStructureIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Salary structure ID is required',
      'string.pattern.base': 'Salary structure ID must be a valid MongoDB ObjectId',
      'any.required': 'Salary structure ID is required'
    })
});

// Route param validation for company ID
const companyIdParamSchema = Joi.object({
  companyId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Company ID is required',
      'string.pattern.base': 'Company ID must be a valid MongoDB ObjectId',
      'any.required': 'Company ID is required'
    })
});

module.exports = {
  runPayrollSchema,
  listPayrollSchema,
  getPayslipSchema,
  getPayslipQuerySchema,
  approvePayslipSchema,
  payPayslipSchema,
  payPayslipBodySchema,
  bankExportSchema,
  generatePdfSchema,
  emailPayslipSchema,
  // Salary Structure schemas
  createSalaryStructureSchema,
  listSalaryStructuresSchema,
  updateSalaryStructureSchema,
  salaryStructureIdSchema,
  companyIdParamSchema
};

