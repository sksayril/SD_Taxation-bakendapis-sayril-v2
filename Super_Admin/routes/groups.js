const express = require('express');
const router = express.Router();

const {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  getSubGroups,
  getGroupsByNature,
  searchGroups
} = require('../controllers/groupsController');

const {
  validateCreateGroup,
  validateUpdateGroup,
  validateQuery,
  validateSearch,
  validateNature
} = require('../validations/groupsValidation');

const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create Group
router.post('/create', validateCreateGroup, createGroup);

// Get All Groups (with pagination, search, and filtering)
router.get('/', validateQuery, getAllGroups);

// Get Groups by Nature
router.get('/nature/:nature', validateNature, validateQuery, getGroupsByNature);

// Search Groups by Name
router.get('/search', validateSearch, searchGroups);

// Get Group by ID
router.get('/:id', getGroupById);

// Get Subgroups of a specific group
router.get('/:id/subgroups', getSubGroups);

// Update Group
router.post('/:id', validateUpdateGroup, updateGroup);

// Delete Group
router.post('/:id/delete', deleteGroup);

module.exports = router;
