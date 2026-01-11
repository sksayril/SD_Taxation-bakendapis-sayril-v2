const express = require('express');
const router = express.Router();

const {
  createStockVoucher,
  getAllStockVouchers,
  getStockVoucherById,
  updateStockVoucher,
  deleteStockVoucher,
  getStockVouchersByType,
  getStockVouchersByStatus,
  searchStockVouchers,
  createReturnVoucher,
  updateStockVoucherStatus
} = require('../controllers/stockVouchersController');

const {
  validateCreateStockVoucher,
  validateUpdateStockVoucher,
  validateQuery,
  validateSearch,
  validateVoucherType,
  validateStatus,
  validateStatusUpdate,
  validateReturnVoucher
} = require('../validations/stockVouchersValidation');

const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create Stock Voucher
router.post('/create', validateCreateStockVoucher, createStockVoucher);

// Get All Stock Vouchers (with pagination, search, and filtering)
router.get('/', validateQuery, getAllStockVouchers);

// Get Stock Vouchers by Type
router.get('/type/:voucherType', validateVoucherType, validateQuery, getStockVouchersByType);

// Get Stock Vouchers by Status
router.get('/status/:status', validateStatus, validateQuery, getStockVouchersByStatus);

// Search Stock Vouchers
router.get('/search', validateSearch, searchStockVouchers);

// Get Stock Voucher by ID
router.get('/:id', getStockVoucherById);

// Update Stock Voucher
router.post('/:id', validateUpdateStockVoucher, updateStockVoucher);

// Update Stock Voucher Status
router.post('/:id/status', validateStatusUpdate, updateStockVoucherStatus);

// Create Return Voucher
router.post('/:originalVoucherId/return', validateReturnVoucher, createReturnVoucher);

// Delete Stock Voucher
router.post('/:id/delete', deleteStockVoucher);

module.exports = router;
