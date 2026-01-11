const CompanySubscription = require('../models/CompanySubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Company = require('../models/Company');

// ✅ Assign Subscription to Company
exports.assignSubscription = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required'
      });
    }

    const { company, plan, startDate, endDate, autoRenew, notes } = req.body;

    // Validate company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Validate plan exists
    const planExists = await SubscriptionPlan.findById(plan);
    if (!planExists) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    // Check if plan is active
    if (!planExists.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign inactive subscription plan'
      });
    }

    // Check if company already has a subscription
    const existingSubscription = await CompanySubscription.findOne({ company });
    
    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.plan = plan;
      existingSubscription.startDate = startDate ? new Date(startDate) : new Date();
      existingSubscription.endDate = new Date(endDate);
      existingSubscription.autoRenew = autoRenew || false;
      existingSubscription.notes = notes || '';
      existingSubscription.assigned_by = req.user.id;
      
      // Update status based on dates
      const now = new Date();
      if (existingSubscription.endDate >= now && existingSubscription.startDate <= now) {
        existingSubscription.status = 'active';
      } else if (existingSubscription.endDate < now) {
        existingSubscription.status = 'expired';
      }
      
      await existingSubscription.save();
      
      const updatedSubscription = await CompanySubscription.findById(existingSubscription._id)
        .populate('company', 'company_name company_email')
        .populate('plan', 'planName price duration features')
        .populate('assigned_by', 'name email');

      return res.json({
        success: true,
        message: 'Company subscription updated successfully',
        data: updatedSubscription
      });
    }

    // Create new subscription
    const subscription = await CompanySubscription.create({
      company,
      plan,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      autoRenew: autoRenew || false,
      notes: notes || '',
      assigned_by: req.user.id,
      status: 'active'
    });

    const newSubscription = await CompanySubscription.findById(subscription._id)
      .populate('company', 'company_name company_email')
      .populate('plan', 'planName price duration features')
      .populate('assigned_by', 'name email');

    res.status(201).json({
      success: true,
      message: 'Subscription assigned to company successfully',
      data: newSubscription
    });
  } catch (err) {
    console.error('Assign subscription error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Company already has a subscription'
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Get All Company Subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const { status, company } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    if (company) {
      query.company = company;
    }

    const subscriptions = await CompanySubscription.find(query)
      .populate('company', 'company_name company_email company_phone')
      .populate('plan', 'planName price duration features maxEmployees maxAdmins')
      .populate('assigned_by', 'name email')
      .sort({ createdAt: -1 });

    // Add isActive field to each subscription
    const subscriptionsWithStatus = subscriptions.map(sub => {
      const subObj = sub.toObject();
      subObj.isActive = sub.isValid();
      return subObj;
    });

    res.json({
      success: true,
      message: 'Company subscriptions retrieved successfully',
      data: subscriptionsWithStatus,
      count: subscriptionsWithStatus.length
    });
  } catch (err) {
    console.error('Get company subscriptions error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Get Company Subscription by ID
exports.getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await CompanySubscription.findById(id)
      .populate('company', 'company_name company_email company_phone')
      .populate('plan', 'planName price duration features maxEmployees maxAdmins')
      .populate('assigned_by', 'name email');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Company subscription not found'
      });
    }

    const subObj = subscription.toObject();
    subObj.isActive = subscription.isValid();

    res.json({
      success: true,
      message: 'Company subscription retrieved successfully',
      data: subObj
    });
  } catch (err) {
    console.error('Get company subscription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Get Subscription by Company ID
exports.getSubscriptionByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const subscription = await CompanySubscription.findOne({ company: companyId })
      .populate('company', 'company_name company_email company_phone')
      .populate('plan', 'planName price duration features maxEmployees maxAdmins')
      .populate('assigned_by', 'name email');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found for this company'
      });
    }

    const subObj = subscription.toObject();
    subObj.isActive = subscription.isValid();

    res.json({
      success: true,
      message: 'Company subscription retrieved successfully',
      data: subObj
    });
  } catch (err) {
    console.error('Get company subscription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Update Company Subscription
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If plan is being updated, validate it exists
    if (updateData.plan) {
      const planExists = await SubscriptionPlan.findById(updateData.plan);
      if (!planExists) {
        return res.status(404).json({
          success: false,
          message: 'Subscription plan not found'
        });
      }
    }

    // Convert date strings to Date objects if provided
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const subscription = await CompanySubscription.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('company', 'company_name company_email')
      .populate('plan', 'planName price duration features')
      .populate('assigned_by', 'name email');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Company subscription not found'
      });
    }

    // Update status based on dates
    const now = new Date();
    if (subscription.endDate >= now && subscription.startDate <= now && subscription.status !== 'cancelled' && subscription.status !== 'suspended') {
      subscription.status = 'active';
    } else if (subscription.endDate < now && subscription.status === 'active') {
      subscription.status = 'expired';
    }
    await subscription.save();

    const subObj = subscription.toObject();
    subObj.isActive = subscription.isValid();

    res.json({
      success: true,
      message: 'Company subscription updated successfully',
      data: subObj
    });
  } catch (err) {
    console.error('Update company subscription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Delete Company Subscription
exports.deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await CompanySubscription.findByIdAndDelete(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Company subscription not found'
      });
    }

    res.json({
      success: true,
      message: 'Company subscription deleted successfully'
    });
  } catch (err) {
    console.error('Delete company subscription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Check if Company has Active Subscription (Helper function for middleware)
exports.checkCompanySubscription = async (companyId) => {
  try {
    const subscription = await CompanySubscription.findOne({ company: companyId })
      .populate('plan');

    if (!subscription) {
      return {
        hasSubscription: false,
        isActive: false,
        message: 'No subscription found for this company'
      };
    }

    const isValid = subscription.isValid();

    return {
      hasSubscription: true,
      isActive: isValid,
      subscription: subscription,
      message: isValid ? 'Subscription is active' : 'Subscription has expired or is inactive'
    };
  } catch (err) {
    console.error('Check company subscription error:', err);
    return {
      hasSubscription: false,
      isActive: false,
      message: 'Error checking subscription'
    };
  }
};

