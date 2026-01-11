const Joi = require('joi');

// Create Payroll Voucher Schema
exports.createPayrollVoucherSchema = Joi.object({
  companyId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.empty': 'Company ID is required',
    'string.pattern.base': 'Company ID must be a valid MongoDB ObjectId'
  }),
  empCode: Joi.string().min(3).max(20).pattern(/^[A-Z0-9]+$/).required().messages({
    'string.empty': 'Employee code is required',
    'string.min': 'Employee code must be at least 3 characters',
    'string.max': 'Employee code cannot exceed 20 characters',
    'string.pattern.base': 'Employee code can only contain uppercase letters and numbers'
  }),
  month: Joi.string().pattern(/^(0[1-9]|1[0-2])$/).required().messages({
    'string.empty': 'Month is required',
    'string.pattern.base': 'Month must be between 01 and 12'
  }),
  year: Joi.string().pattern(/^(19|20)\d{2}$/).required().messages({
    'string.empty': 'Year is required',
    'string.pattern.base': 'Year must be a valid 4-digit year'
  }),
  grossSalary: Joi.number().min(0).max(99999999).required().messages({
    'number.base': 'Gross salary must be a number',
    'number.min': 'Gross salary cannot be negative',
    'number.max': 'Gross salary cannot exceed 99,999,999',
    'any.required': 'Gross salary is required'
  }),
  deductions: Joi.object({
    pf: Joi.number().min(0).max(9999999).default(0).messages({
      'number.base': 'PF deduction must be a number',
      'number.min': 'PF deduction cannot be negative',
      'number.max': 'PF deduction cannot exceed 9,999,999'
    }),
    esi: Joi.number().min(0).max(9999999).default(0).messages({
      'number.base': 'ESI deduction must be a number',
      'number.min': 'ESI deduction cannot be negative',
      'number.max': 'ESI deduction cannot exceed 9,999,999'
    }),
    tax: Joi.number().min(0).max(9999999).default(0).messages({
      'number.base': 'Tax deduction must be a number',
      'number.min': 'Tax deduction cannot be negative',
      'number.max': 'Tax deduction cannot exceed 9,999,999'
    }),
    other: Joi.number().min(0).max(9999999).default(0).messages({
      'number.base': 'Other deductions must be a number',
      'number.min': 'Other deductions cannot be negative',
      'number.max': 'Other deductions cannot exceed 9,999,999'
    })
  }).unknown(true).default({}), // Allow additional deduction fields
  netPay: Joi.number().min(0).max(99999999).required().messages({
    'number.base': 'Net pay must be a number',
    'number.min': 'Net pay cannot be negative',
    'number.max': 'Net pay cannot exceed 99,999,999',
    'any.required': 'Net pay is required'
  }),
  paymentVoucherNo: Joi.string().pattern(/^SAL\/\d{4}\/\d{3}$/).messages({
    'string.pattern.base': 'Payment voucher number must be in format SAL/YYYY/XXX'
  }),
  status: Joi.string().valid('Draft', 'Approved', 'Paid', 'Cancelled').default('Draft').messages({
    'any.only': 'Status must be one of: Draft, Approved, Paid, Cancelled'
  }),
  paymentDate: Joi.date().messages({
    'date.base': 'Payment date must be a valid date'
  }),
  remarks: Joi.string().max(500).messages({
    'string.max': 'Remarks cannot exceed 500 characters'
  })
});

// Update Payroll Voucher Schema
exports.updatePayrollVoucherSchema = Joi.object({
  companyId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Company ID must be a valid MongoDB ObjectId'
  }),
  empCode: Joi.string().min(3).max(20).pattern(/^[A-Z0-9]+$/).messages({
    'string.min': 'Employee code must be at least 3 characters',
    'string.max': 'Employee code cannot exceed 20 characters',
    'string.pattern.base': 'Employee code can only contain uppercase letters and numbers'
  }),
  month: Joi.string().pattern(/^(0[1-9]|1[0-2])$/).messages({
    'string.pattern.base': 'Month must be between 01 and 12'
  }),
  year: Joi.string().pattern(/^(19|20)\d{2}$/).messages({
    'string.pattern.base': 'Year must be a valid 4-digit year'
  }),
  grossSalary: Joi.number().min(0).max(99999999).messages({
    'number.base': 'Gross salary must be a number',
    'number.min': 'Gross salary cannot be negative',
    'number.max': 'Gross salary cannot exceed 99,999,999'
  }),
  deductions: Joi.object({
    pf: Joi.number().min(0).max(9999999).messages({
      'number.base': 'PF deduction must be a number',
      'number.min': 'PF deduction cannot be negative',
      'number.max': 'PF deduction cannot exceed 9,999,999'
    }),
    esi: Joi.number().min(0).max(9999999).messages({
      'number.base': 'ESI deduction must be a number',
      'number.min': 'ESI deduction cannot be negative',
      'number.max': 'ESI deduction cannot exceed 9,999,999'
    }),
    tax: Joi.number().min(0).max(9999999).messages({
      'number.base': 'Tax deduction must be a number',
      'number.min': 'Tax deduction cannot be negative',
      'number.max': 'Tax deduction cannot exceed 9,999,999'
    }),
    other: Joi.number().min(0).max(9999999).messages({
      'number.base': 'Other deductions must be a number',
      'number.min': 'Other deductions cannot be negative',
      'number.max': 'Other deductions cannot exceed 9,999,999'
    })
  }),
  netPay: Joi.number().min(0).max(99999999).messages({
    'number.base': 'Net pay must be a number',
    'number.min': 'Net pay cannot be negative',
    'number.max': 'Net pay cannot exceed 99,999,999'
  }),
  paymentVoucherNo: Joi.string().pattern(/^SAL\/\d{4}\/\d{3}$/).messages({
    'string.pattern.base': 'Payment voucher number must be in format SAL/YYYY/XXX'
  }),
  status: Joi.string().valid('Draft', 'Approved', 'Paid', 'Cancelled').messages({
    'any.only': 'Status must be one of: Draft, Approved, Paid, Cancelled'
  }),
  paymentDate: Joi.date().messages({
    'date.base': 'Payment date must be a valid date'
  }),
  remarks: Joi.string().max(500).messages({
    'string.max': 'Remarks cannot exceed 500 characters'
  })
});

// Payroll Voucher Query Schema (for filtering)
exports.payrollVoucherQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  search: Joi.string().max(100).messages({
    'string.max': 'Search term cannot exceed 100 characters'
  }),
  empCode: Joi.string().pattern(/^[A-Z0-9]+$/).messages({
    'string.pattern.base': 'Employee code can only contain uppercase letters and numbers'
  }),
  year: Joi.string().pattern(/^(19|20)\d{2}$/).messages({
    'string.pattern.base': 'Year must be a valid 4-digit year'
  }),
  month: Joi.string().pattern(/^(0[1-9]|1[0-2])$/).messages({
    'string.pattern.base': 'Month must be between 01 and 12'
  }),
  status: Joi.string().valid('Draft', 'Approved', 'Paid', 'Cancelled').messages({
    'any.only': 'Status must be one of: Draft, Approved, Paid, Cancelled'
  })
});

// Bulk Payroll Creation Schema
exports.bulkPayrollCreationSchema = Joi.object({
  companyId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.empty': 'Company ID is required',
    'string.pattern.base': 'Company ID must be a valid MongoDB ObjectId'
  }),
  year: Joi.string().pattern(/^(19|20)\d{2}$/).required().messages({
    'string.empty': 'Year is required',
    'string.pattern.base': 'Year must be a valid 4-digit year'
  }),
  month: Joi.string().pattern(/^(0[1-9]|1[0-2])$/).required().messages({
    'string.empty': 'Month is required',
    'string.pattern.base': 'Month must be between 01 and 12'
  }),
  payrolls: Joi.array().items(
    Joi.object({
      empCode: Joi.string().min(3).max(20).pattern(/^[A-Z0-9]+$/).required().messages({
        'string.empty': 'Employee code is required',
        'string.min': 'Employee code must be at least 3 characters',
        'string.max': 'Employee code cannot exceed 20 characters',
        'string.pattern.base': 'Employee code can only contain uppercase letters and numbers'
      }),
      grossSalary: Joi.number().min(0).max(99999999).required().messages({
        'number.base': 'Gross salary must be a number',
        'number.min': 'Gross salary cannot be negative',
        'number.max': 'Gross salary cannot exceed 99,999,999',
        'any.required': 'Gross salary is required'
      }),
      deductions: Joi.object({
        pf: Joi.number().min(0).max(9999999).default(0),
        esi: Joi.number().min(0).max(9999999).default(0),
        tax: Joi.number().min(0).max(9999999).default(0),
        other: Joi.number().min(0).max(9999999).default(0)
      }).default({}),
      remarks: Joi.string().max(500).messages({
        'string.max': 'Remarks cannot exceed 500 characters'
      })
    })
  ).min(1).required().messages({
    'array.min': 'At least one payroll entry is required',
    'any.required': 'Payrolls array is required'
  })
});
