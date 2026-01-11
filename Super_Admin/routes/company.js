const express = require('express');
const router = express.Router();

const { 
  createCompany, 
  getAllCompanies, 
  getCompanyById, 
  updateCompany, 
  deleteCompany, 
  updateCompanyStatus 
} = require('../controllers/companyController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');
const { 
  createCompanySchema, 
  updateCompanySchema, 
  updateCompanyStatusSchema 
} = require('../validations/companyValidation');

// All routes require authentication
router.use(auth);

// Create Company
router.post('/create', auth, handleUpload, validate(createCompanySchema), createCompany);

// Get All Companies
router.get('/', getAllCompanies);

// Get Company by ID
router.get('/:id', getCompanyById);

// Update Company
router.post('/:id', handleUpload, validate(updateCompanySchema), updateCompany);

// Update Company Status
router.patch('/:id/status', validate(updateCompanyStatusSchema), updateCompanyStatus);

// Delete Company
router.post('/:id/delete', deleteCompany);

module.exports = router;
