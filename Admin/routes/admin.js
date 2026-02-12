const express = require('express');
const router = express.Router();

const { 
  createAdmin, 
  getAllAdmins, 
  getAdminById, 
  updateAdmin, 
  deleteAdmin,
  login,
  logout,
  debugAdmins,
  deleteAllAdmins,
  whoAmI
} = require('../controllers/adminController');

const {
  updateHRMUser,
  deleteHRMUser,
  updateHRMEmployee,
  deleteHRMEmployee,
  updateCRMRecord,
  deleteCRMRecord,
  updateERPRecord,
  deleteERPRecord,
  updatePayrollPayslip,
  deletePayrollPayslip,
  updateAdminPermissions,
  getAdminPermissions
} = require('../controllers/moduleManagementController');

const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { verifySuperAdmin } = require('../middleware/auth');
const { checkModulePermission } = require('../middleware/permissions');
const { createAdminSchema, updateAdminSchema, loginSchema, updatePermissionsSchema } = require('../validations/adminValidation');

// Create Admin Route (SuperAdmin only) - TEMPORARILY REMOVED AUTH FOR TESTING
router.post('/create-admin', validate(createAdminSchema), createAdmin);

// Get all admins (SuperAdmin only)
router.get('/admins', verifySuperAdmin, getAllAdmins);

// Get admin by ID (SuperAdmin only)
router.get('/admins/:id', verifySuperAdmin, getAdminById);

// Update admin (SuperAdmin only)
router.post('/update-admin/:id', verifySuperAdmin, validate(updateAdminSchema), updateAdmin);

// Delete admin (SuperAdmin only)
router.post('/delete-admin/:id', verifySuperAdmin, deleteAdmin);

// Admin Login (No authentication required)
router.post('/login', validate(loginSchema), login);

// Admin Logout (No authentication required)
router.post('/logout', logout);

// Debug routes (for debugging only - REMOVE IN PRODUCTION)
router.get('/debug-admins', debugAdmins);
router.post('/delete-all-admins', deleteAllAdmins);

// Who Am I Route (requires authentication)
router.get('/whoami', auth, whoAmI);

// Module Management Routes (Admin with permissions or SuperAdmin)
// HRM Module
router.post('/hrm/update-user/:id', auth, checkModulePermission('hrm', 'update'), updateHRMUser);
router.post('/hrm/delete-user/:id', auth, checkModulePermission('hrm', 'delete'), deleteHRMUser);
router.post('/hrm/update-employee/:id', auth, checkModulePermission('hrm', 'update'), updateHRMEmployee);
router.post('/hrm/delete-employee/:id', auth, checkModulePermission('hrm', 'delete'), deleteHRMEmployee);

// CRM Module
router.post('/crm/update/:id', auth, checkModulePermission('crm', 'update'), updateCRMRecord);
router.post('/crm/delete/:id', auth, checkModulePermission('crm', 'delete'), deleteCRMRecord);

// ERP Module
router.post('/erp/update/:id', auth, checkModulePermission('erp', 'update'), updateERPRecord);
router.post('/erp/delete/:id', auth, checkModulePermission('erp', 'delete'), deleteERPRecord);

// Payroll Module
router.post('/payroll/update-payslip/:id', auth, checkModulePermission('payroll', 'update'), updatePayrollPayslip);
router.post('/payroll/delete-payslip/:id', auth, checkModulePermission('payroll', 'delete'), deletePayrollPayslip);

// Admin Permission Management (SuperAdmin only)
router.post('/permissions/:id', verifySuperAdmin, validate(updatePermissionsSchema), updateAdminPermissions);
router.get('/permissions/:id', verifySuperAdmin, getAdminPermissions);

module.exports = router;
