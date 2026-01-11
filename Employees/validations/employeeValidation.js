const Joi = require('joi');

// Create Employee Schema
exports.createEmployeeSchema = Joi.object({
  fullname: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name cannot exceed 100 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email address'
  }),
  password: Joi.string().min(6).messages({
    'string.min': 'Password must be at least 6 characters'
  }),
  phone: Joi.string().min(10).max(20).required().messages({
    'string.empty': 'Phone number is required',
    'string.min': 'Phone number must be at least 10 characters',
    'string.max': 'Phone number cannot exceed 20 characters'
  }),
  department: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Department is required',
    'string.min': 'Department must be at least 2 characters',
    'string.max': 'Department cannot exceed 100 characters'
  }),
  designation: Joi.string().min(2).max(100).messages({
    'string.min': 'Designation must be at least 2 characters',
    'string.max': 'Designation cannot exceed 100 characters'
  }),
  empCode: Joi.string().min(3).max(20).pattern(/^[A-Z0-9]+$/).required().messages({
    'string.empty': 'Employee code is required',
    'string.min': 'Employee code must be at least 3 characters',
    'string.max': 'Employee code cannot exceed 20 characters',
    'string.pattern.base': 'Employee code can only contain uppercase letters and numbers'
  }),
  salary: Joi.number().min(0).max(99999999).required().messages({
    'number.base': 'Salary must be a number',
    'number.min': 'Salary cannot be negative',
    'number.max': 'Salary cannot exceed 99,999,999'
  }),
  bankDetails: Joi.object({
    bankName: Joi.string().max(100).messages({
      'string.max': 'Bank name cannot exceed 100 characters'
    }),
    accountNumber: Joi.string().max(20).pattern(/^[0-9]+$/).messages({
      'string.max': 'Account number cannot exceed 20 characters',
      'string.pattern.base': 'Account number can only contain digits'
    }),
    ifsc: Joi.string().max(11).pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).messages({
      'string.max': 'IFSC code cannot exceed 11 characters',
      'string.pattern.base': 'Invalid IFSC code format (e.g., SBIN0001234)'
    }),
    branch: Joi.string().max(100).messages({
      'string.max': 'Branch name cannot exceed 100 characters'
    })
  }),
  aadharId: Joi.string().length(12).pattern(/^[0-9]{12}$/).messages({
    'string.length': 'Aadhar ID must be exactly 12 digits',
    'string.pattern.base': 'Aadhar ID must contain only digits'
  }),
  panNo: Joi.string().length(10).pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).messages({
    'string.length': 'PAN number must be exactly 10 characters',
    'string.pattern.base': 'Invalid PAN number format (e.g., ABCDE1234F)'
  }),
  joinDate: Joi.date().required().messages({
    'date.base': 'Join date must be a valid date',
    'any.required': 'Join date is required'
  }),
  address: Joi.object({
    street: Joi.string().max(200).messages({
      'string.max': 'Street address cannot exceed 200 characters'
    }),
    city: Joi.string().max(100).messages({
      'string.max': 'City cannot exceed 100 characters'
    }),
    state: Joi.string().max(100).messages({
      'string.max': 'State cannot exceed 100 characters'
    }),
    country: Joi.string().max(100).messages({
      'string.max': 'Country cannot exceed 100 characters'
    }),
    zipCode: Joi.string().max(20).messages({
      'string.max': 'Zip code cannot exceed 20 characters'
    })
  }),
  role: Joi.string().valid('Employee', 'HR', 'OR', 'Developer').messages({
    'any.only': 'Role must be one of Employee, HR, OR, or Developer'
  }),
  company: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.empty': 'Company ID is required',
    'string.pattern.base': 'Company ID must be a valid MongoDB ObjectId'
  })
});

// Update Employee Schema
exports.updateEmployeeSchema = Joi.object({
  fullname: Joi.string().min(2).max(100).messages({
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name cannot exceed 100 characters'
  }),
  email: Joi.string().email().messages({
    'string.email': 'Please enter a valid email address'
  }),
  password: Joi.string().min(6).messages({
    'string.min': 'Password must be at least 6 characters'
  }),
  phone: Joi.string().min(10).max(20).messages({
    'string.min': 'Phone number must be at least 10 characters',
    'string.max': 'Phone number cannot exceed 20 characters'
  }),
  department: Joi.string().min(2).max(100).messages({
    'string.min': 'Department must be at least 2 characters',
    'string.max': 'Department cannot exceed 100 characters'
  }),
  designation: Joi.string().min(2).max(100).messages({
    'string.min': 'Designation must be at least 2 characters',
    'string.max': 'Designation cannot exceed 100 characters'
  }),
  empCode: Joi.string().min(3).max(20).pattern(/^[A-Z0-9]+$/).messages({
    'string.min': 'Employee code must be at least 3 characters',
    'string.max': 'Employee code cannot exceed 20 characters',
    'string.pattern.base': 'Employee code can only contain uppercase letters and numbers'
  }),
  salary: Joi.number().min(0).max(99999999).messages({
    'number.base': 'Salary must be a number',
    'number.min': 'Salary cannot be negative',
    'number.max': 'Salary cannot exceed 99,999,999'
  }),
  bankDetails: Joi.object({
    bankName: Joi.string().max(100).messages({
      'string.max': 'Bank name cannot exceed 100 characters'
    }),
    accountNumber: Joi.string().max(20).pattern(/^[0-9]+$/).messages({
      'string.max': 'Account number cannot exceed 20 characters',
      'string.pattern.base': 'Account number can only contain digits'
    }),
    ifsc: Joi.string().max(11).pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).messages({
      'string.max': 'IFSC code cannot exceed 11 characters',
      'string.pattern.base': 'Invalid IFSC code format (e.g., SBIN0001234)'
    }),
    branch: Joi.string().max(100).messages({
      'string.max': 'Branch name cannot exceed 100 characters'
    })
  }),
  aadharId: Joi.string().length(12).pattern(/^[0-9]{12}$/).messages({
    'string.length': 'Aadhar ID must be exactly 12 digits',
    'string.pattern.base': 'Aadhar ID must contain only digits'
  }),
  panNo: Joi.string().length(10).pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).messages({
    'string.length': 'PAN number must be exactly 10 characters',
    'string.pattern.base': 'Invalid PAN number format (e.g., ABCDE1234F)'
  }),
  joinDate: Joi.date().messages({
    'date.base': 'Join date must be a valid date'
  }),
  address: Joi.object({
    street: Joi.string().max(200).messages({
      'string.max': 'Street address cannot exceed 200 characters'
    }),
    city: Joi.string().max(100).messages({
      'string.max': 'City cannot exceed 100 characters'
    }),
    state: Joi.string().max(100).messages({
      'string.max': 'State cannot exceed 100 characters'
    }),
    country: Joi.string().max(100).messages({
      'string.max': 'Country cannot exceed 100 characters'
    }),
    zipCode: Joi.string().max(20).messages({
      'string.max': 'Zip code cannot exceed 20 characters'
    })
  }),
});

// Employee Login Schema
exports.loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email address'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  })
});
