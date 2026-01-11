const SubscriptionPlan = require('../models/SubscriptionPlan');

// ✅ Create Subscription Plan
exports.createPlan = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required'
      });
    }

    const {
      planName,
      description,
      price,
      currency,
      duration,
      features,
      maxEmployees,
      maxAdmins,
      isActive
    } = req.body;

    // Check if plan name already exists
    const existingPlan = await SubscriptionPlan.findOne({ planName });
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: 'Plan name already exists'
      });
    }

    // Create subscription plan
    const plan = await SubscriptionPlan.create({
      planName,
      description: description || '',
      price,
      currency: currency || 'INR',
      duration,
      features: features || [],
      maxEmployees: maxEmployees || null,
      maxAdmins: maxAdmins || 1,
      isActive: isActive !== undefined ? isActive : true,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: plan
    });
  } catch (err) {
    console.error('Create subscription plan error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Plan name already exists'
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Get All Subscription Plans
exports.getAllPlans = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    let query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const plans = await SubscriptionPlan.find(query)
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Subscription plans retrieved successfully',
      data: plans,
      count: plans.length
    });
  } catch (err) {
    console.error('Get subscription plans error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Get Subscription Plan by ID
exports.getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findById(id)
      .populate('created_by', 'name email');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Subscription plan retrieved successfully',
      data: plan
    });
  } catch (err) {
    console.error('Get subscription plan error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Update Subscription Plan
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if plan name is being updated and if it already exists
    if (updateData.planName) {
      const existingPlan = await SubscriptionPlan.findOne({
        planName: updateData.planName,
        _id: { $ne: id }
      });
      if (existingPlan) {
        return res.status(400).json({
          success: false,
          message: 'Plan name already exists'
        });
      }
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('created_by', 'name email');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan
    });
  } catch (err) {
    console.error('Update subscription plan error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Plan name already exists'
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Delete Subscription Plan
exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByIdAndDelete(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Subscription plan deleted successfully'
    });
  } catch (err) {
    console.error('Delete subscription plan error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

