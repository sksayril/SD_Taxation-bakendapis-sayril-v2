const HR = require('../models/HR');
const Company = require('../../Super_Admin/models/Company');
const jwt = require('jsonwebtoken');
const { verifyCompanySubscription } = require('../../Super_Admin/middleware/checkSubscription');

// helper: token generator
const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'change-me';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Helper function to filter password from HR data (for Admin/SuperAdmin, include password)
const filterHRData = (hr, includePassword = true) => {
  const hrObj = hr.toObject ? hr.toObject() : hr;
  if (!includePassword) {
    delete hrObj.password;
  }
  return hrObj;
};

// ✅ Create HR/Finance controller
exports.createHR = async (req, res) => {
  try {
    // Defensive check for req.body
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { 
      fullname, 
      username, 
      email, 
      password, 
      phone, 
      designation, 
      address, 
      role, 
      company 
    } = req.body;

    // Validate role
    if (!role || !['HR', 'Finance', 'Accountant'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Role must be either HR, Finance, or Accountant' 
      });
    }

    // Determine company: use req.body.company if provided, otherwise use req.user.company
    let companyId = company;
    if (!companyId && req.user.company) {
      companyId = req.user.company;
    }

    if (!companyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company ID is required' 
      });
    }

    // Validate company ObjectId
    if (!isValidObjectId(companyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid company ID format' 
      });
    }

    // Check if email already exists
    const existingEmail = await HR.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }

    // Check if username already exists
    const existingUsername = await HR.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Verify company exists
    const companyExists = await Company.findById(companyId);
    if (!companyExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }

    // Create HR user (password stored in plain text)
    const hrUser = await HR.create({
      fullname,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: password, // Store password in plain text
      phone,
      designation,
      address,
      role,
      company: companyId,
      createdBy: req.user ? req.user.id : "68f210dae0021a8a2431defc" // From auth middleware or default
    });

    // Return HR user data (including password for Admin/SuperAdmin)
    const hrUserData = filterHRData(hrUser, true);

    const successMessage = 'HR created successfully';

    res.status(201).json({
      success: true,
      message: successMessage,
      data: hrUserData
    });
  } catch (err) {
    console.error('Create HR/OR error:', err);
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      let message = '';
      
      switch(field) {
        case 'email':
          message = 'Email already exists';
          break;
        case 'username':
          message = 'Username already exists';
          break;
        default:
          message = `${field} already exists`;
      }
      
      return res.status(409).json({ 
        success: false, 
        message 
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Get all HR/Finance users controller
exports.getAllHR = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const department = req.query.department || '';
    const role = req.query.role || '';

    // Build query - default to HR users (can be overridden by role filter)
    let query = {
      role: 'HR'
    };

    // Search functionality
    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by department
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    // Filter by role
    if (role && ['HR', 'Finance', 'Accountant'].includes(role)) {
      query.role = role;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get HR users with pagination (include password for Admin/SuperAdmin)
    const hrUsers = await HR.find(query)
      .populate('company', 'company_name company_email')
      .populate('createdBy', 'fullname email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await HR.countDocuments(query);
    const pages = Math.ceil(total / limit);

    // Convert to JSON with password included for Admin/SuperAdmin
    const hrUsersWithPasswords = hrUsers.map(hr => hr.toJSON({ includePassword: true }));

    res.json({
      success: true,
      message: "HR users retrieved successfully",
      data: hrUsersWithPasswords,
      meta: {
        total,
        page,
        limit,
        pages
      }
    });
  } catch (err) {
    console.error('Get HR/OR users error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Get HR/Finance user by ID controller
exports.getHRById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid HR/OR user ID format' 
      });
    }
    
    const hrUser = await HR.findById(id)
      .populate('company', 'company_name company_email company_phone')
      .populate('createdBy', 'fullname email');

    if (!hrUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'HR/OR user not found' 
      });
    }

    // Check if user is HR, Finance, or Accountant
    if (!['HR', 'Finance', 'Accountant'].includes(hrUser.role)) {
      return res.status(404).json({ 
        success: false, 
        message: 'User is not HR, Finance, or Accountant' 
      });
    }

    // Convert to JSON with password included for Admin/SuperAdmin
    const hrUserWithPassword = hrUser.toJSON({ includePassword: true });

    res.json({
      success: true,
      message: "HR user retrieved successfully",
      data: hrUserWithPassword
    });
  } catch (err) {
    console.error('Get HR/OR user error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Update HR/Finance user controller
exports.updateHR = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid HR/OR user ID format' 
      });
    }

    const updateData = req.body;

    // Check if HR/Finance user exists
    const existingHR = await HR.findById(id);
    if (!existingHR) {
      return res.status(404).json({ 
        success: false, 
        message: 'HR/OR user not found' 
      });
    }

    // Check for duplicate email if email is being updated
    if (updateData.email && updateData.email !== existingHR.email) {
      const emailExists = await HR.findOne({ 
        email: updateData.email.toLowerCase(),
        _id: { $ne: id }
      });
      if (emailExists) {
        return res.status(409).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }
      updateData.email = updateData.email.toLowerCase();
    }

    // Check for duplicate username if username is being updated
    if (updateData.username && updateData.username !== existingHR.username) {
      const usernameExists = await HR.findOne({ 
        username: updateData.username.toLowerCase(),
        _id: { $ne: id }
      });
      if (usernameExists) {
        return res.status(409).json({ 
          success: false, 
          message: 'Username already exists' 
        });
      }
      updateData.username = updateData.username.toLowerCase();
    }

    // Update HR/Finance user
    const hrUser = await HR.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    )
    .populate('company', 'company_name company_email')
    .populate('createdBy', 'fullname email')
    .select('-password');

    res.json({
      success: true,
      message: "HR/OR user updated successfully",
      data: hrUser
    });
  } catch (err) {
    console.error('Update HR/OR user error:', err);
    
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ 
        success: false, 
        message: `${field} already exists` 
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Delete HR/OR user controller
exports.deleteHR = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid HR/OR user ID format' 
      });
    }
    
    const hrUser = await HR.findById(id);

    if (!hrUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'HR/OR user not found' 
      });
    }

    await HR.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "HR/OR user deleted successfully"
    });
  } catch (err) {
    console.error('Delete HR/OR user error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ HR/OR Login controller
exports.login = async (req, res) => {
  try {
    // Defensive check for req.body
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { email, password } = req.body;
    console.log('Searching for HR user with email:', email); // Debug log

    // Find HR/OR user by email
    const hrUser = await HR.findOne({ 
      email: email.toLowerCase()
    }).populate('company', 'company_name company_email');
    
    console.log('HR user found:', hrUser ? 'Yes' : 'No'); // Debug log
    if (hrUser) {
      console.log('HR user role:', hrUser.role);
      console.log('HR user email:', hrUser.email);
    }
    
    if (!hrUser) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    console.log('Verifying password...'); // Debug log
    const isMatch = await hrUser.comparePassword(password);
    console.log('Password match:', isMatch); // Debug log
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check company subscription status
    const subscriptionCheck = await verifyCompanySubscription(hrUser.company._id);
    if (!subscriptionCheck.isValid) {
      return res.status(403).json({
        success: false,
        message: subscriptionCheck.message,
        code: subscriptionCheck.code || 'SUBSCRIPTION_INACTIVE',
        subscription: subscriptionCheck.subscription
      });
    }

    // Update last login
    hrUser.lastLogin = new Date();
    await hrUser.save();

    // Generate JWT token
    const token = signToken({ 
      id: hrUser._id, 
      role: hrUser.role, 
      email: hrUser.email,
      company: hrUser.company._id 
    });

    // Return HR/OR user data (excluding password)
    const hrUserData = filterHRData(hrUser);

    res.json({
      success: true,
      message: "Login successful",
      data: hrUserData,
      token
    });
  } catch (err) {
    console.error('HR/OR login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ HR/OR Logout controller
exports.logout = async (req, res) => {
  try {
    // Since JWT is stateless, we can't invalidate the token on the server side
    // The client should remove the token from storage
    
    res.json({
      success: true,
      message: "Logout successful"
    });
  } catch (err) {
    console.error('HR/OR logout error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Debug HR users (for troubleshooting only)
exports.debugHRUsers = async (req, res) => {
  try {
    const hrUsers = await HR.find({}).select('-password');
    console.log('All HR users in database:', hrUsers);
    
    res.json({
      success: true,
      message: "HR users retrieved for debugging",
      count: hrUsers.length,
      data: hrUsers
    });
  } catch (err) {
    console.error('Debug HR users error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Who Am I controller
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

    // Get full user details from database
    const fullUser = await HR.findById(user.id)
      .populate('company', 'company_name company_email company_phone')
      .populate('createdBy', 'fullname email');
    
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

    res.json({
      success: true,
      message: 'User details retrieved successfully',
      data: {
        user: {
          _id: fullUser._id,
          fullname: fullUser.fullname,
          username: fullUser.username,
          email: fullUser.email,
          role: fullUser.role,
          phone: fullUser.phone,
          department: fullUser.department,
          designation: fullUser.designation,
          address: fullUser.address,
          company: fullUser.company,
          createdBy: fullUser.createdBy,
          lastLogin: fullUser.lastLogin,
          createdAt: fullUser.createdAt,
          updatedAt: fullUser.updatedAt
        },
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
