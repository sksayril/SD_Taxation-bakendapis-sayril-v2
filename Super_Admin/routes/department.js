const express = require('express');
const router = express.Router();

const { 
  createDepartment, 
  getAllDepartments,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { createDepartmentSchema, updateDepartmentSchema } = require('../validations/departmentValidation');

// All routes require authentication
router.use(auth);

// Create Department
router.post('/create', validate(createDepartmentSchema), createDepartment);

// Get All Departments
router.get('/', getAllDepartments);

// Update Department
router.put('/:id', validate(updateDepartmentSchema), updateDepartment);
router.post('/:id/update', validate(updateDepartmentSchema), updateDepartment);

// Delete Department
router.delete('/:id', deleteDepartment);
router.post('/:id/delete', deleteDepartment);

module.exports = router;
