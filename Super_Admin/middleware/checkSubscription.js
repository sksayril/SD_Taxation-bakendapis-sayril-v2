const CompanySubscription = require('../models/CompanySubscription');

/**
 * Middleware to check if a company has an active subscription
 * This should be used before allowing login or access to protected resources
 */
const checkCompanySubscription = async (req, res, next) => {
  try {
    // Get company ID from user object (set by auth middleware)
    const companyId = req.user?.company;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company information not found in user token'
      });
    }

    // Check subscription
    const subscription = await CompanySubscription.findOne({ company: companyId })
      .populate('plan');

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Your company does not have an active subscription. Please contact the administrator.',
        code: 'NO_SUBSCRIPTION'
      });
    }

    // Check if subscription is valid
    const now = new Date();
    const isValid = subscription.status === 'active' && 
                    subscription.startDate <= now && 
                    subscription.endDate >= now;

    if (!isValid) {
      let message = 'Your company subscription has expired. Please renew your subscription.';
      
      if (subscription.status === 'cancelled') {
        message = 'Your company subscription has been cancelled. Please contact the administrator.';
      } else if (subscription.status === 'suspended') {
        message = 'Your company subscription has been suspended. Please contact the administrator.';
      } else if (subscription.endDate < now) {
        message = `Your company subscription expired on ${subscription.endDate.toLocaleDateString()}. Please renew your subscription.`;
      }

      return res.status(403).json({
        success: false,
        message: message,
        code: 'SUBSCRIPTION_INACTIVE',
        subscription: {
          status: subscription.status,
          endDate: subscription.endDate,
          plan: subscription.plan?.planName
        }
      });
    }

    // Attach subscription info to request for use in controllers
    req.subscription = subscription;
    next();
  } catch (err) {
    console.error('Check subscription middleware error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error checking subscription status'
    });
  }
};

/**
 * Helper function to check subscription status (for use in login controllers)
 * Returns subscription status without sending response
 */
const verifyCompanySubscription = async (companyId) => {
  try {
    if (!companyId) {
      return {
        isValid: false,
        message: 'Company ID is required'
      };
    }

    const subscription = await CompanySubscription.findOne({ company: companyId })
      .populate('plan');

    if (!subscription) {
      return {
        isValid: false,
        message: 'No subscription found for this company',
        code: 'NO_SUBSCRIPTION'
      };
    }

    const now = new Date();
    const isValid = subscription.status === 'active' && 
                    subscription.startDate <= now && 
                    subscription.endDate >= now;

    if (!isValid) {
      let message = 'Your company subscription has expired. Please renew your subscription.';
      
      if (subscription.status === 'cancelled') {
        message = 'Your company subscription has been cancelled. Please contact the administrator.';
      } else if (subscription.status === 'suspended') {
        message = 'Your company subscription has been suspended. Please contact the administrator.';
      } else if (subscription.endDate < now) {
        message = `Your company subscription expired on ${subscription.endDate.toLocaleDateString()}. Please renew your subscription.`;
      }

      return {
        isValid: false,
        message: message,
        code: 'SUBSCRIPTION_INACTIVE',
        subscription: {
          status: subscription.status,
          endDate: subscription.endDate,
          plan: subscription.plan?.planName
        }
      };
    }

    return {
      isValid: true,
      message: 'Subscription is active',
      subscription: subscription
    };
  } catch (err) {
    console.error('Verify subscription error:', err);
    return {
      isValid: false,
      message: 'Error checking subscription status'
    };
  }
};

module.exports = checkCompanySubscription;
module.exports.verifyCompanySubscription = verifyCompanySubscription;

