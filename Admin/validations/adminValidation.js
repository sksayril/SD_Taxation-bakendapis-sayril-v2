const Joi = require('joi');

// Create Admin Schema
exports.createAdminSchema = Joi.object({
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
  originalPassword: Joi.string().min(6).required().messages({
    'string.empty': 'Original password is required',
    'string.min': 'Original password must be at least 6 characters'
  }),
  role: Joi.string().valid('Admin').required().messages({
    'string.empty': 'Role is required',
    'any.only': 'Role must be Admin'
  }),
  phone: Joi.string().min(10).max(20).required().messages({
    'string.empty': 'Phone number is required',
    'string.min': 'Phone number must be at least 10 characters',
    'string.max': 'Phone number cannot exceed 20 characters'
  }),
  adminArea: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Admin area is required',
    'string.min': 'Admin area must be at least 2 characters',
    'string.max': 'Admin area cannot exceed 100 characters'
  }),
  company: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.empty': 'Company ID is required',
    'string.pattern.base': 'Company ID must be a valid MongoDB ObjectId'
  }),
  department: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().allow(null, '').messages({
    'string.pattern.base': 'Department ID must be a valid MongoDB ObjectId'
  }),
  permissions: Joi.object({
    hrm: Joi.object({
      create: Joi.boolean().optional(),
      read: Joi.boolean().optional(),
      update: Joi.boolean().optional(),
      delete: Joi.boolean().optional()
    }).optional(),
    crm: Joi.object({
      create: Joi.boolean().optional(),
      read: Joi.boolean().optional(),
      update: Joi.boolean().optional(),
      delete: Joi.boolean().optional()
    }).optional(),
    erp: Joi.object({
      create: Joi.boolean().optional(),
      read: Joi.boolean().optional(),
      update: Joi.boolean().optional(),
      delete: Joi.boolean().optional()
    }).optional(),
    payroll: Joi.object({
      create: Joi.boolean().optional(),
      read: Joi.boolean().optional(),
      update: Joi.boolean().optional(),
      delete: Joi.boolean().optional()
    }).optional()
  }).optional()
});

// Update Admin Schema
exports.updateAdminSchema = Joi.object({
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
  phone: Joi.string().min(10).max(20).messages({
    'string.min': 'Phone number must be at least 10 characters',
    'string.max': 'Phone number cannot exceed 20 characters'
  }),
  adminArea: Joi.string().min(2).max(100).messages({
    'string.min': 'Admin area must be at least 2 characters',
    'string.max': 'Admin area cannot exceed 100 characters'
  }),
  company: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Company ID must be a valid MongoDB ObjectId'
  }),
  status: Joi.string().valid('active', 'inactive', 'suspended').messages({
    'any.only': 'Status must be active, inactive, or suspended'
  })
});

// Admin Login Schema
exports.loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email address'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  })
});

// Update Permissions Schema
const modulePermissionSchema = Joi.object({
  access: Joi.boolean().required(),
  canCreate: Joi.boolean().required(),
  canRead: Joi.boolean().required(),
  canUpdate: Joi.boolean().required(),
  canDelete: Joi.boolean().required()
});

exports.updatePermissionsSchema = Joi.object({
  permissions: Joi.object({
    hrm: modulePermissionSchema,
    crm: modulePermissionSchema,
    erp: modulePermissionSchema,
    payroll: modulePermissionSchema
  }).required().messages({
    'object.base': 'Permissions must be an object',
    'any.required': 'Permissions object is required'
  })
});
