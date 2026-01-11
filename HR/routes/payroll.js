const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const validate = require('../middleware/validate');
const {
  runPayroll,
  listPayrolls,
  getPayslip,
  approvePayslip,
  payPayslip,
  bankExport,
  generatePdf,
  emailPayslip
} = require('../controllers/payrollController');
const {
  createSalaryStructure,
  listSalaryStructures,
  getSalaryStructure,
  updateSalaryStructure,
  deleteSalaryStructure,
  getDefaultSalaryStructure
} = require('../controllers/salaryStructureController');
const {
  runPayrollSchema,
  listPayrollSchema,
  getPayslipQuerySchema,
  approvePayslipSchema,
  payPayslipBodySchema,
  bankExportSchema,
  generatePdfSchema,
  emailPayslipSchema,
  createSalaryStructureSchema,
  listSalaryStructuresSchema,
  updateSalaryStructureSchema,
  salaryStructureIdSchema,
  companyIdParamSchema
} = require('../lib/validationSchemas');

// All routes require authentication
router.use(auth);

// POST /api/payroll/run - Run payroll for a company
router.post('/run', validate(runPayrollSchema), runPayroll);

// GET /api/payroll - List payslips by filters
router.get('/', validate(listPayrollSchema), listPayrolls);

// GET /api/payslip/:employeeId - Get payslip for employee
router.get('/payslip/:employeeId', validate(getPayslipQuerySchema), getPayslip);

// POST /api/payroll/:payslipId/approve - Approve a payslip
router.post('/:payslipId/approve', validate(approvePayslipSchema), approvePayslip);

// POST /api/payroll/:payslipId/pay - Mark payslip as paid
router.post('/:payslipId/pay', validate(payPayslipBodySchema), payPayslip);

// GET /api/payroll/bank-export - Export bank payment file
router.get('/bank-export', validate(bankExportSchema), bankExport);

// POST /api/payslip/:payslipId/generate-pdf - Generate PDF for payslip
router.post('/payslip/:payslipId/generate-pdf', validate(generatePdfSchema), generatePdf);

// POST /api/payslip/:payslipId/email - Email payslip to employee
router.post('/payslip/:payslipId/email', validate(emailPayslipSchema), emailPayslip);

// Salary Structure Routes

// POST /api/payroll/salary-structure - Create a new salary structure
router.post('/salary-structure', validate(createSalaryStructureSchema), createSalaryStructure);

// GET /api/payroll/salary-structure - List salary structures for a company
router.get('/salary-structure', validate(listSalaryStructuresSchema), listSalaryStructures);

// GET /api/payroll/salary-structure/:id - Get a specific salary structure
router.get('/salary-structure/:id', validate(salaryStructureIdSchema), getSalaryStructure);

// POST /api/payroll/salary-structure/:id/update - Update a salary structure
router.post('/salary-structure/:id/update', validate(updateSalaryStructureSchema), updateSalaryStructure);

// POST /api/payroll/salary-structure/:id/delete - Delete a salary structure
router.post('/salary-structure/:id/delete', validate(salaryStructureIdSchema), deleteSalaryStructure);

// GET /api/payroll/salary-structure/company/:companyId/default - Get default salary structure
router.get('/salary-structure/company/:companyId/default', validate(companyIdParamSchema), getDefaultSalaryStructure);

module.exports = router;

