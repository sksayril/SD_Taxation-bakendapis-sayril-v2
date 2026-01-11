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

const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { verifySuperAdmin } = require('../middleware/auth');
const { createAdminSchema, updateAdminSchema, loginSchema } = require('../validations/adminValidation');

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

module.exports = router;
