const express = require('express');
const router = express.Router();

const {
  createLedger,
  getAllLedgers,
  getLedgerById,
  updateLedger,
  deleteLedger,
  getLedgersByGroup,
  getLedgersByType,
  searchLedgers
} = require('../controllers/ledgersController');

const {
  validateCreateLedger,
  validateUpdateLedger,
  validateQuery,
  validateSearch,
  validateGroup,
  validateLedgerType
} = require('../validations/ledgersValidation');

const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create Ledger
router.post('/create', validateCreateLedger, createLedger);

// Get All Ledgers (with pagination, search, and filtering)
router.get('/', validateQuery, getAllLedgers);

// Get Ledgers by Group
router.get('/group/:groupName', validateGroup, validateQuery, getLedgersByGroup);

// Get Ledgers by Type
router.get('/type/:ledgerType', validateLedgerType, validateQuery, getLedgersByType);

// Search Ledgers by Name
router.get('/search', validateSearch, searchLedgers);

// Get Ledger by ID
router.get('/:id', getLedgerById);

// Update Ledger
router.post('/:id', validateUpdateLedger, updateLedger);

// Delete Ledger
router.post('/:id/delete', deleteLedger);

module.exports = router;
