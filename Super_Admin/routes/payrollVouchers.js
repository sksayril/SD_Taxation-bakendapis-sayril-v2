const express = require('express');
const router = express.Router();

// Import controllers
const {
  createPayrollVoucher,
  getAllPayrollVouchers,
  getPayrollVoucherById,
  updatePayrollVoucher,
  deletePayrollVoucher,
  getPayrollByEmployee,
  getPayrollByPeriod,
  bulkCreatePayrollVouchers,
  generatePaymentVoucherNumber,
  getPayrollSummary
} = require('../controllers/payrollVoucherController');

// Import validation schemas
const {
  createPayrollVoucherSchema,
  updatePayrollVoucherSchema,
  payrollVoucherQuerySchema,
  bulkPayrollCreationSchema
} = require('../validations/payrollVoucherValidation');

// Import middleware
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Apply authentication middleware to all routes
router.use(auth);

// ✅ Create Payroll Voucher
// POST /api/payroll-vouchers
router.post('/', 
  validate(createPayrollVoucherSchema), 
  createPayrollVoucher
);

// ✅ Get All Payroll Vouchers
// GET /api/payroll-vouchers
router.get('/', 
  validate(payrollVoucherQuerySchema, 'query'), 
  getAllPayrollVouchers
);

// ✅ Get Payroll by Employee and Period
// GET /api/payroll-vouchers/employee/payroll
router.get('/employee/payroll', getPayrollByEmployee);

// ✅ Get Payroll by Period
// GET /api/payroll-vouchers/period/payroll
router.get('/period/payroll', getPayrollByPeriod);

// ✅ Generate Payment Voucher Number
// GET /api/payroll-vouchers/generate-voucher-number
router.get('/generate-voucher-number', generatePaymentVoucherNumber);

// ✅ Get Payroll Summary
// GET /api/payroll-vouchers/summary
router.get('/summary', getPayrollSummary);

// ✅ Bulk Create Payroll Vouchers
// POST /api/payroll-vouchers/bulk
router.post('/bulk', 
  validate(bulkPayrollCreationSchema), 
  bulkCreatePayrollVouchers
);

// ✅ Update Payroll Voucher
// POST /api/payroll-vouchers/:id/update
router.post('/:id/update', 
  validate(updatePayrollVoucherSchema), 
  updatePayrollVoucher
);

// ✅ Delete Payroll Voucher
// POST /api/payroll-vouchers/:id/delete
router.post('/:id/delete', deletePayrollVoucher);

// ✅ Get Payroll Voucher by ID
// GET /api/payroll-vouchers/:id
router.get('/:id', getPayrollVoucherById);

// ✅ Update Payroll Voucher (Legacy PUT method)
// PUT /api/payroll-vouchers/:id
router.put('/:id', 
  validate(updatePayrollVoucherSchema), 
  updatePayrollVoucher
);

// ✅ Delete Payroll Voucher (Legacy DELETE method)
// DELETE /api/payroll-vouchers/:id
router.delete('/:id', deletePayrollVoucher);

module.exports = router;
