const Joi = require('joi');

// Create HR/OR Schema
exports.createHRSchema = Joi.object({
  fullname: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name cannot exceed 100 characters'
  }),
  username: Joi.string().min(3).max(50).alphanum().required().messages({
    'string.empty': 'Username is required',
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username cannot exceed 50 characters',
    'string.alphanum': 'Username can only contain letters and numbers'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email address'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters'
  }),
  phone: Joi.string().min(10).max(20).required().messages({
    'string.empty': 'Phone number is required',
    'string.min': 'Phone number must be at least 10 characters',
    'string.max': 'Phone number cannot exceed 20 characters'
  }),
  designation: Joi.string().min(2).max(100).messages({
    'string.min': 'Designation must be at least 2 characters',
    'string.max': 'Designation cannot exceed 100 characters'
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
  role: Joi.string().valid('HR', 'Finance', 'Accountant').required().messages({
    'string.empty': 'Role is required',
    'any.only': 'Role must be either HR, Finance, or Accountant'
  }),
  company: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Company ID must be a valid MongoDB ObjectId'
  })
});

// Update HR/OR Schema
exports.updateHRSchema = Joi.object({
  fullname: Joi.string().min(2).max(100).messages({
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name cannot exceed 100 characters'
  }),
  username: Joi.string().min(3).max(50).alphanum().messages({
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username cannot exceed 50 characters',
    'string.alphanum': 'Username can only contain letters and numbers'
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
  designation: Joi.string().min(2).max(100).messages({
    'string.min': 'Designation must be at least 2 characters',
    'string.max': 'Designation cannot exceed 100 characters'
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
  role: Joi.string().valid('HR', 'Finance', 'Accountant').messages({
    'any.only': 'Role must be either HR, Finance, or Accountant'
  })
});

// HR/OR Login Schema
exports.loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email address'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  })
});
