const express = require('express');
const router = express.Router();

const { signup, login, logout, forgetPassword, changePassword, resetPassword, whoAmI } = require('../controllers/superAdminController');
const { getDashboard } = require('../controllers/dashboardController');
const { filterCompanies } = require('../controllers/companyController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { signupSchema, loginSchema, forgetPasswordSchema, changePasswordSchema, resetPasswordSchema } = require('../validations/superAdminValidation');
const { filterCompaniesSchema } = require('../validations/companyValidation');

// Signup Route
router.post('/signup', validate(signupSchema), signup);

// Login Route
router.post('/login', validate(loginSchema), login);

// Logout Route (requires authentication)
router.post('/logout', auth, logout);

// Forget Password Route
router.post('/forget-password', validate(forgetPasswordSchema), forgetPassword);

// Change Password Route (requires authentication)
router.post('/change-password', auth, validate(changePasswordSchema), changePassword);

// Reset Password Route
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Who Am I Route (requires authentication)
router.get('/whoami', auth, whoAmI);

// Dashboard Route (requires authentication - SuperAdmin only)
router.get('/dashboard', auth, getDashboard);

// Filter Companies Route (requires authentication - SuperAdmin only)
router.post('/companies/filter', auth, validate(filterCompaniesSchema), filterCompanies);

module.exports = router;
