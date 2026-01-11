const express = require('express');
const router = express.Router();

const {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan
} = require('../controllers/subscriptionPlanController');

const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const {
  createPlanSchema,
  updatePlanSchema
} = require('../validations/subscriptionValidation');

// All routes require authentication (SuperAdmin only)
router.use(auth);

// Create Subscription Plan
router.post('/create', validate(createPlanSchema), createPlan);

// Get All Subscription Plans
router.get('/', getAllPlans);

// Get Subscription Plan by ID
router.get('/:id', getPlanById);

// Update Subscription Plan
router.put('/:id', validate(updatePlanSchema), updatePlan);

// Delete Subscription Plan
router.delete('/:id', deletePlan);

module.exports = router;

