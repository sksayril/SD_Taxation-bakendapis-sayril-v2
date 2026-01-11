const SuperAdmin = require('../Super_Admin/models/SuperAdmin');
const Admin = require('../Admin/models/Admin');
const Employee = require('../Employees/models/Employee');
const HR = require('../HR/models/HR');

// ✅ Unified Who Am I controller
exports.whoAmI = async (req, res) => {
  try {
    // Get user details from token (set by auth middleware)
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    let fullUser = null;
    let userType = null;

    // Determine user type and fetch full user details
    switch (user.role) {
      case 'superadmin':
        fullUser = await SuperAdmin.findById(user.id);
        userType = 'SuperAdmin';
        break;
      
      case 'Admin':
        fullUser = await Admin.findById(user.id)
          .populate('company', 'company_name company_email')
          .populate('created_by', 'name email');
        userType = 'Admin';
        break;
      
      case 'Employee':
        fullUser = await Employee.findById(user.id)
          .populate('company', 'company_name company_email company_phone')
          .populate('createdBy', 'fullname email');
        userType = 'Employee';
        break;
      
      case 'HR':
        fullUser = await HR.findById(user.id)
          .populate('company', 'company_name company_email company_phone')
          .populate('createdBy', 'fullname email');
        userType = 'HR';
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid user role'
        });
    }

    if (!fullUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate token expiration
    const tokenExpiration = new Date(user.exp * 1000); // Convert from Unix timestamp
    const currentTime = new Date();
    const timeUntilExpiry = tokenExpiration.getTime() - currentTime.getTime();
    const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
    const minutesUntilExpiry = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60));

    // Prepare user data based on user type
    let userData = {
      _id: fullUser._id,
      role: fullUser.role,
      email: fullUser.email,
      createdAt: fullUser.createdAt,
      updatedAt: fullUser.updatedAt
    };

    // Add user-specific fields
    if (userType === 'SuperAdmin') {
      userData = {
        ...userData,
        name: fullUser.name,
        lastLogin: fullUser.lastLogin
      };
    } else if (userType === 'Admin') {
      userData = {
        ...userData,
        fullname: fullUser.fullname,
        username: fullUser.username,
        phone: fullUser.phone,
        adminArea: fullUser.adminArea,
        company: fullUser.company,
        created_by: fullUser.created_by,
        status: fullUser.status,
        lastLogin: fullUser.lastLogin
      };
    } else if (userType === 'Employee') {
      userData = {
        ...userData,
        fullname: fullUser.fullname,
        phone: fullUser.phone,
        department: fullUser.department,
        designation: fullUser.designation,
        address: fullUser.address,
        company: fullUser.company,
        createdBy: fullUser.createdBy,
        lastLogin: fullUser.lastLogin
      };
    } else if (userType === 'HR') {
      userData = {
        ...userData,
        fullname: fullUser.fullname,
        username: fullUser.username,
        phone: fullUser.phone,
        department: fullUser.department,
        designation: fullUser.designation,
        address: fullUser.address,
        company: fullUser.company,
        createdBy: fullUser.createdBy,
        lastLogin: fullUser.lastLogin
      };
    }

    res.json({
      success: true,
      message: 'User details retrieved successfully',
      data: {
        user: userData,
        userType: userType,
        token: {
          issuedAt: new Date(user.iat * 1000).toISOString(),
          expiresAt: tokenExpiration.toISOString(),
          expiresIn: `${hoursUntilExpiry}h ${minutesUntilExpiry}m`,
          isExpired: timeUntilExpiry <= 0
        }
      }
    });
  } catch (err) {
    console.error('Who Am I error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
