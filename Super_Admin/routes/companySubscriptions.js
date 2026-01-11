const express = require('express');
const router = express.Router();

const {
  assignSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  getSubscriptionByCompany,
  updateSubscription,
  deleteSubscription
} = require('../controllers/companySubscriptionController');

const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const {
  assignSubscriptionSchema,
  updateSubscriptionSchema
} = require('../validations/subscriptionValidation');

// All routes require authentication (SuperAdmin only)
router.use(auth);

// Assign Subscription to Company
router.post('/assign', validate(assignSubscriptionSchema), assignSubscription);

// Get All Company Subscriptions
router.get('/', getAllSubscriptions);

// Get Company Subscription by ID
router.get('/:id', getSubscriptionById);

// Get Subscription by Company ID
router.get('/company/:companyId', getSubscriptionByCompany);

// Update Company Subscription
router.put('/:id', validate(updateSubscriptionSchema), updateSubscription);

// Delete Company Subscription
router.delete('/:id', deleteSubscription);

module.exports = router;

