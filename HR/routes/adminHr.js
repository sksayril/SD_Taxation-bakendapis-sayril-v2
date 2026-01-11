const express = require('express');
const router = express.Router();

const { 
  createHR, 
  getAllHR, 
  getHRById, 
  updateHR, 
  deleteHR,
  login,
  logout,
  debugHRUsers,
  whoAmI
} = require('../controllers/hrController');

const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/auth');
const { createHRSchema, updateHRSchema, loginSchema } = require('../validations/hrValidation');

// HR/OR Authentication Routes (No authentication required)
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

// Debug route (for debugging only)
router.get('/debug-hr', debugHRUsers);

// HR Management Routes (Admin or SuperAdmin only) - TEMPORARILY REMOVED AUTH FOR TESTING
router.post('/hr', validate(createHRSchema), createHR);
router.get('/hr', getAllHR);
router.get('/hr/:id', getHRById);
router.post('/update-hr/:id', verifyAdmin, validate(updateHRSchema), updateHR);
router.post('/delete-hr/:id', verifyAdmin, deleteHR);

// Who Am I Route (requires authentication)
router.get('/whoami', auth, whoAmI);

module.exports = router;
