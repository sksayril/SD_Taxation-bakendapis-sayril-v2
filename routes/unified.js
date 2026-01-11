const express = require('express');
const router = express.Router();

const { whoAmI } = require('../controllers/unifiedController');
const auth = require('../middleware/auth');

// Unified Who Am I Route (works for all user types)
router.get('/whoami', auth, whoAmI);

module.exports = router;
