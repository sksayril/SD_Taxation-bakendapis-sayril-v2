const express = require('express');
const router = express.Router();

const { 
  createEmployee, 
  getEmployees, 
  getEmployeeById, 
  updateEmployee, 
  deleteEmployee,
  login,
  logout,
  debugEmployees,
  whoAmI
} = require('../controllers/employeeController');

const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { verifyAdmin, verifyAdminOrHR } = require('../middleware/auth');
const { createEmployeeSchema, updateEmployeeSchema, loginSchema } = require('../validations/employeeValidation');

// Employee Authentication Routes (No authentication required)
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

// All routes below this line require authentication
router.use(auth);

// Employee Management Routes (Admin, Company HR, or SuperAdmin)
router.post('/employees', verifyAdminOrHR, validate(createEmployeeSchema), createEmployee);
router.get('/employees', verifyAdminOrHR, getEmployees);
router.get('/employees/:id', verifyAdminOrHR, getEmployeeById);
router.post('/update-employee/:id', verifyAdminOrHR, validate(updateEmployeeSchema), updateEmployee);
router.post('/delete-employee/:id', verifyAdminOrHR, deleteEmployee);

// Debug route (for debugging only - REMOVE IN PRODUCTION)
router.get('/debug-employees', debugEmployees);

// Who Am I Route (requires authentication)
router.get('/whoami', auth, whoAmI);

module.exports = router;
