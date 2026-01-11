const express = require('express');
const router = express.Router();

const {
  createStockGroup,
  getAllStockGroups,
  getStockGroupById,
  updateStockGroup,
  deleteStockGroup,
  getStockGroupsByParent,
  searchStockGroups
} = require('../controllers/stockGroupsController');

const {
  validateCreateStockGroup,
  validateUpdateStockGroup,
  validateQuery,
  validateSearch,
  validateParentGroup
} = require('../validations/stockGroupsValidation');

const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create Stock Group
router.post('/create', validateCreateStockGroup, createStockGroup);

// Get All Stock Groups (with pagination, search, and filtering)
router.get('/', validateQuery, getAllStockGroups);

// Get Stock Groups by Parent Group
router.get('/parent/:parentGroup', validateParentGroup, validateQuery, getStockGroupsByParent);

// Search Stock Groups
router.get('/search', validateSearch, searchStockGroups);

// Get Stock Group by ID
router.get('/:id', getStockGroupById);

// Update Stock Group
router.post('/:id', validateUpdateStockGroup, updateStockGroup);

// Delete Stock Group
router.post('/:id/delete', deleteStockGroup);

module.exports = router;
