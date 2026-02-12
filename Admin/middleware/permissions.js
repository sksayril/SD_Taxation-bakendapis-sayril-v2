const Admin = require('../models/Admin');

/**
 * Middleware to check if admin has access to a specific module
 * @param {string} module - Module name (hrm, crm, erp, payroll)
 * @param {string} action - Action to check (create, read, update, delete)
 */
const checkModulePermission = (module, action = 'read') => {
  return async (req, res, next) => {
    try {
      // Get admin from token
      const adminId = req.user?.id;
      
      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Fetch admin with permissions
      const admin = await Admin.findById(adminId);
      
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Check if admin is active
      if (admin.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive or suspended'
        });
      }

      // SuperAdmin has all permissions
      if (req.user.role === 'superadmin') {
        return next();
      }

      // Check module access
      const modulePermission = admin.permissions?.[module];
      
      if (!modulePermission || !modulePermission.access) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have access to ${module.toUpperCase()} module.`
        });
      }

      // Check specific action permission
      const actionKey = `can${action.charAt(0).toUpperCase() + action.slice(1)}`;
      
      if (!modulePermission[actionKey]) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have permission to ${action} in ${module.toUpperCase()} module.`
        });
      }

      // Attach admin to request for use in controllers
      req.admin = admin;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

/**
 * Middleware to check if admin has access to any of the specified modules
 * @param {Array<string>} modules - Array of module names
 */
const checkAnyModuleAccess = (modules) => {
  return async (req, res, next) => {
    try {
      const adminId = req.user?.id;
      
      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const admin = await Admin.findById(adminId);
      
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      if (admin.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive or suspended'
        });
      }

      // SuperAdmin has all permissions
      if (req.user.role === 'superadmin') {
        return next();
      }

      // Check if admin has access to at least one module
      const hasAccess = modules.some(module => {
        const modulePermission = admin.permissions?.[module];
        return modulePermission && modulePermission.access;
      });

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have access to any of the required modules: ${modules.join(', ').toUpperCase()}`
        });
      }

      req.admin = admin;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

module.exports = {
  checkModulePermission,
  checkAnyModuleAccess
};
