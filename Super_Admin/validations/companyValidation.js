const Joi = require('joi');

// Create Company Schema
exports.createCompanySchema = Joi.object({
  company_name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Company name is required',
    'string.min': 'Company name must be at least 2 characters',
    'string.max': 'Company name must not exceed 100 characters'
  }),
  company_email: Joi.string().email().required().messages({
    'string.empty': 'Company email is required',
    'string.email': 'Please enter a valid email address'
  }),
  company_phone: Joi.string().min(10).max(20).required().messages({
    'string.empty': 'Company phone is required',
    'string.min': 'Company phone must be at least 10 characters',
    'string.max': 'Company phone must not exceed 20 characters'
  }),
  company_address: Joi.alternatives().try(
    Joi.object({
      street: Joi.string().min(5).max(200).required().messages({
        'string.empty': 'Street address is required',
        'string.min': 'Street address must be at least 5 characters',
        'string.max': 'Street address must not exceed 200 characters'
      }),
      city: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'City is required',
        'string.min': 'City must be at least 2 characters',
        'string.max': 'City must not exceed 100 characters'
      }),
      state: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'State is required',
        'string.min': 'State must be at least 2 characters',
        'string.max': 'State must not exceed 100 characters'
      }),
      country: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'Country is required',
        'string.min': 'Country must be at least 2 characters',
        'string.max': 'Country must not exceed 100 characters'
      }),
      zipCode: Joi.string().min(3).max(20).required().messages({
        'string.empty': 'Zip code is required',
        'string.min': 'Zip code must be at least 3 characters',
        'string.max': 'Zip code must not exceed 20 characters'
      })
    }),
    Joi.string().custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
        return helpers.error('any.invalid');
      } catch (error) {
        return helpers.error('any.invalid');
      }
    }).messages({
      'any.invalid': 'Company address must be a valid JSON object'
    })
  ).required().messages({
    'any.required': 'Company address is required'
  }),
  company_logo: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Company logo must be a valid URL'
  }),
  company_website: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Company website must be a valid URL'
  }),
  gstNumber: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/).optional().allow('').messages({
    'string.pattern.base': 'Invalid GST number format (e.g., 22ABCDE1234F1Z5)'
  }),
  fiscalYear: Joi.string().pattern(/^[0-9]{4}-[0-9]{4}$/).optional().allow('').messages({
    'string.pattern.base': 'Fiscal year must be in format YYYY-YYYY (e.g., 2024-2025)'
  }),
  industries: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Industries must not exceed 500 characters'
  }),
  constitution_of_business: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Constitution of business must not exceed 500 characters'
  })
});

// Update Company Schema
exports.updateCompanySchema = Joi.object({
  company_name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Company name must be at least 2 characters',
    'string.max': 'Company name must not exceed 100 characters'
  }),
  company_email: Joi.string().email().optional().messages({
    'string.email': 'Please enter a valid email address'
  }),
  company_phone: Joi.string().min(10).max(20).optional().messages({
    'string.min': 'Company phone must be at least 10 characters',
    'string.max': 'Company phone must not exceed 20 characters'
  }),
  company_address: Joi.object({
    street: Joi.string().min(5).max(200).optional().messages({
      'string.min': 'Street address must be at least 5 characters',
      'string.max': 'Street address must not exceed 200 characters'
    }),
    city: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'City must be at least 2 characters',
      'string.max': 'City must not exceed 100 characters'
    }),
    state: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'State must be at least 2 characters',
      'string.max': 'State must not exceed 100 characters'
    }),
    country: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Country must be at least 2 characters',
      'string.max': 'Country must not exceed 100 characters'
    }),
    zipCode: Joi.string().min(3).max(20).optional().messages({
      'string.min': 'Zip code must be at least 3 characters',
      'string.max': 'Zip code must not exceed 20 characters'
    })
  }).optional(),
  company_logo: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Company logo must be a valid URL'
  }),
  company_website: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Company website must be a valid URL'
  }),
  gstNumber: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/).optional().allow('').messages({
    'string.pattern.base': 'Invalid GST number format (e.g., 22ABCDE1234F1Z5)'
  }),
  fiscalYear: Joi.string().pattern(/^[0-9]{4}-[0-9]{4}$/).optional().allow('').messages({
    'string.pattern.base': 'Fiscal year must be in format YYYY-YYYY (e.g., 2024-2025)'
  }),
  industries: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Industries must not exceed 500 characters'
  }),
  constitution_of_business: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Constitution of business must not exceed 500 characters'
  })
});

// Update Company Status Schema
exports.updateCompanyStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive', 'suspended').required().messages({
    'string.empty': 'Status is required',
    'any.only': 'Status must be one of: active, inactive, suspended'
  })
});
