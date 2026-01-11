const SalaryStructure = require('../models/SalaryStructure');
const Company = require('../../Super_Admin/models/Company');
const AuditLog = require('../models/AuditLog');

/**
 * Helper to determine user role from token
 */
const getUserRole = (req) => {
  return req.user?.role || null;
};

/**
 * Check if user has required role
 */
const hasRole = (req, allowedRoles) => {
  const userRole = getUserRole(req);
  return allowedRoles.includes(userRole);
};

/**
 * POST /api/payroll/salary-structure
 * Create a new salary structure
 * Roles: HR | Finance | SuperAdmin
 */
exports.createSalaryStructure = async (req, res) => {
  try {
    if (!hasRole(req, ['HR', 'Finance', 'Accountant', 'superadmin'])) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR, Finance, Accountant, or SuperAdmin role required.'
      });
    }

    const { companyId, name, baseForPercent, components, isDefault } = req.body;

    // Validate company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // If isDefault is true, unset other default structures for this company
    if (isDefault) {
      await SalaryStructure.updateMany(
        { company: companyId },
        { $unset: { isDefault: 1 } }
      );
    }

    // Create salary structure
    const salaryStructure = await SalaryStructure.create({
      company: companyId,
      name,
      baseForPercent: baseForPercent || 'CTC',
      components,
      isDefault: isDefault || false
    });

    // Create audit log
    const actorRole = getUserRole(req);
    const actorModel = actorRole === 'superadmin'
      ? 'SuperAdmin'
      : actorRole === 'HR'
      ? 'HR'
      : actorRole === 'Finance' || actorRole === 'Accountant'
      ? 'Admin'
      : 'Admin';
    await AuditLog.log(
      companyId,
      req.user.id,
      actorModel,
      'salary_structure.created',
      {
        salaryStructureId: salaryStructure._id,
        name: salaryStructure.name,
        componentCount: salaryStructure.components.length
      }
    );

    res.status(201).json({
      success: true,
      message: 'Salary structure created successfully',
      data: salaryStructure
    });
  } catch (error) {
    console.error('Create salary structure error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Salary structure with this name already exists for this company'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * GET /api/payroll/salary-structure
 * List salary structures for a company
 * Roles: HR | Finance | SuperAdmin
 */
exports.listSalaryStructures = async (req, res) => {
  try {
    if (!hasRole(req, ['HR', 'Finance', 'Accountant', 'superadmin'])) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR, Finance, Accountant, or SuperAdmin role required.'
      });
    }

    const { companyId, page = 1, limit = 20 } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    // Build query
    const query = { company: companyId };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await SalaryStructure.countDocuments(query);

    // Get salary structures
    const salaryStructures = await SalaryStructure.find(query)
      .populate('company', 'company_name')
      .sort({ isDefault: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      message: 'Salary structures retrieved successfully',
      data: salaryStructures,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List salary structures error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * GET /api/payroll/salary-structure/:id
 * Get a specific salary structure by ID
 * Roles: HR | Finance | SuperAdmin
 */
exports.getSalaryStructure = async (req, res) => {
  try {
    if (!hasRole(req, ['HR', 'Finance', 'Accountant', 'superadmin'])) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR, Finance, Accountant, or SuperAdmin role required.'
      });
    }

    const { id } = req.params;

    // Validate ID format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid salary structure ID format'
      });
    }

    const salaryStructure = await SalaryStructure.findById(id)
      .populate('company', 'company_name company_email');

    if (!salaryStructure) {
      return res.status(404).json({
        success: false,
        message: 'Salary structure not found'
      });
    }

    res.json({
      success: true,
      message: 'Salary structure retrieved successfully',
      data: salaryStructure
    });
  } catch (error) {
    console.error('Get salary structure error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * PUT /api/payroll/salary-structure/:id
 * Update a salary structure
 * Roles: HR | Finance | SuperAdmin
 */
exports.updateSalaryStructure = async (req, res) => {
  try {
    if (!hasRole(req, ['HR', 'Finance', 'superadmin'])) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR, Finance, or SuperAdmin role required.'
      });
    }

    const { id } = req.params;
    const { name, baseForPercent, components, isDefault } = req.body;

    // Validate ID format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid salary structure ID format'
      });
    }

    const salaryStructure = await SalaryStructure.findById(id);
    if (!salaryStructure) {
      return res.status(404).json({
        success: false,
        message: 'Salary structure not found'
      });
    }

    // If isDefault is true, unset other default structures for this company
    if (isDefault === true) {
      await SalaryStructure.updateMany(
        { company: salaryStructure.company, _id: { $ne: id } },
        { $unset: { isDefault: 1 } }
      );
    }

    // Update fields
    if (name !== undefined) salaryStructure.name = name;
    if (baseForPercent !== undefined) salaryStructure.baseForPercent = baseForPercent;
    if (components !== undefined) salaryStructure.components = components;
    if (isDefault !== undefined) salaryStructure.isDefault = isDefault;

    await salaryStructure.save();

    // Create audit log
    const actorRoleUpdate = getUserRole(req);
    const actorModel = actorRoleUpdate === 'superadmin'
      ? 'SuperAdmin'
      : actorRoleUpdate === 'HR'
      ? 'HR'
      : actorRoleUpdate === 'Finance' || actorRoleUpdate === 'Accountant'
      ? 'Admin'
      : 'Admin';
    await AuditLog.log(
      salaryStructure.company,
      req.user.id,
      actorModel,
      'salary_structure.updated',
      {
        salaryStructureId: salaryStructure._id,
        name: salaryStructure.name
      }
    );

    res.json({
      success: true,
      message: 'Salary structure updated successfully',
      data: salaryStructure
    });
  } catch (error) {
    console.error('Update salary structure error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Salary structure with this name already exists for this company'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * DELETE /api/payroll/salary-structure/:id
 * Delete a salary structure
 * Roles: HR | Finance | SuperAdmin
 */
exports.deleteSalaryStructure = async (req, res) => {
  try {
    if (!hasRole(req, ['HR', 'Finance', 'Accountant', 'superadmin'])) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR, Finance, Accountant, or SuperAdmin role required.'
      });
    }

    const { id } = req.params;

    // Validate ID format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid salary structure ID format'
      });
    }

    const salaryStructure = await SalaryStructure.findById(id);
    if (!salaryStructure) {
      return res.status(404).json({
        success: false,
        message: 'Salary structure not found'
      });
    }

    // Check if structure is being used (optional - can be enhanced)
    // For now, we'll allow deletion but log it

    const companyId = salaryStructure.company;
    const structureName = salaryStructure.name;

    await SalaryStructure.findByIdAndDelete(id);

    // Create audit log
    const actorModel = getUserRole(req) === 'superadmin' ? 'SuperAdmin' : 
                      getUserRole(req) === 'HR' ? 'HR' : 
                      getUserRole(req) === 'Finance' ? 'Admin' : 'Admin';
    await AuditLog.log(
      companyId,
      req.user.id,
      actorModel,
      'salary_structure.deleted',
      {
        salaryStructureId: id,
        name: structureName
      }
    );

    res.json({
      success: true,
      message: 'Salary structure deleted successfully'
    });
  } catch (error) {
    console.error('Delete salary structure error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * GET /api/payroll/salary-structure/company/:companyId/default
 * Get default salary structure for a company
 * Roles: HR | Finance | SuperAdmin
 */
exports.getDefaultSalaryStructure = async (req, res) => {
  try {
    if (!hasRole(req, ['HR', 'Finance', 'superadmin'])) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR, Finance, or SuperAdmin role required.'
      });
    }

    const { companyId } = req.params;

    // Validate companyId format
    if (!/^[0-9a-fA-F]{24}$/.test(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID format'
      });
    }

    const salaryStructure = await SalaryStructure.getDefaultForCompany(companyId);

    if (!salaryStructure) {
      return res.status(404).json({
        success: false,
        message: 'No default salary structure found for this company'
      });
    }

    res.json({
      success: true,
      message: 'Default salary structure retrieved successfully',
      data: salaryStructure
    });
  } catch (error) {
    console.error('Get default salary structure error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

