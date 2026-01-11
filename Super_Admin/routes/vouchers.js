const express = require('express');
const router = express.Router();

const {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  getVouchersByType,
  getVouchersByDateRange,
  searchVouchers,
  updateVoucherStatus
} = require('../controllers/vouchersController');

const {
  validateCreateVoucher,
  validateUpdateVoucher,
  validateQuery,
  validateSearch,
  validateDateRange,
  validateVoucherType,
  validateStatusUpdate
} = require('../validations/vouchersValidation');

const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create Voucher
router.post('/create', validateCreateVoucher, createVoucher);

// Get All Vouchers (with pagination, search, and filtering)
router.get('/', validateQuery, getAllVouchers);

// Get Vouchers by Type
router.get('/type/:voucherType', validateVoucherType, validateQuery, getVouchersByType);

// Get Vouchers by Date Range
router.get('/date-range', validateDateRange, getVouchersByDateRange);

// Search Vouchers
router.get('/search', validateSearch, searchVouchers);

// Get Voucher by ID
router.get('/:id', getVoucherById);

// Update Voucher
router.post('/:id', validateUpdateVoucher, updateVoucher);

// Update Voucher Status (Approve/Reject)
router.post('/:id/status', validateStatusUpdate, updateVoucherStatus);

// Delete Voucher
router.post('/:id/delete', deleteVoucher);

module.exports = router;
