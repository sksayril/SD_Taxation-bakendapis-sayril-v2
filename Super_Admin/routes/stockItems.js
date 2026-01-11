const express = require('express');
const router = express.Router();

const {
  createStockItem,
  getAllStockItems,
  getStockItemById,
  updateStockItem,
  deleteStockItem,
  getStockItemsByGroup,
  getStockItemsByStatus,
  getLowStockItems,
  searchStockItems,
  updateStockQuantity
} = require('../controllers/stockItemsController');

const {
  validateCreateStockItem,
  validateUpdateStockItem,
  validateQuery,
  validateSearch,
  validateStockGroup,
  validateStatus,
  validateQuantityUpdate
} = require('../validations/stockItemsValidation');

const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create Stock Item
router.post('/create', validateCreateStockItem, createStockItem);

// Get All Stock Items (with pagination, search, and filtering)
router.get('/', validateQuery, getAllStockItems);

// Get Stock Items by Group
router.get('/group/:stockGroup', validateStockGroup, validateQuery, getStockItemsByGroup);

// Get Stock Items by Status
router.get('/status/:status', validateStatus, validateQuery, getStockItemsByStatus);

// Get Low Stock Items
router.get('/low-stock', validateQuery, getLowStockItems);

// Search Stock Items
router.get('/search', validateSearch, searchStockItems);

// Get Stock Item by ID
router.get('/:id', getStockItemById);

// Update Stock Item
router.post('/:id', validateUpdateStockItem, updateStockItem);

// Update Stock Quantity
router.post('/:id/quantity', validateQuantityUpdate, updateStockQuantity);

// Delete Stock Item
router.post('/:id/delete', deleteStockItem);

module.exports = router;
