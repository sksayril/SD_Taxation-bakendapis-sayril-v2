const Admin = require('../models/Admin');
const Company = require('../../Super_Admin/models/Company');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyCompanySubscription } = require('../../Super_Admin/middleware/checkSubscription');

// helper: token generator
const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'change-me';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

// ✅ Create Admin controller
exports.createAdmin = async (req, res) => {
  try {
    // Defensive check for req.body
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { fullname, username, email, password, originalPassword, phone, adminArea, company } = req.body;

    // Check if email already exists
    const existingEmail = await Admin.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Check if username already exists
    const existingUsername = await Admin.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already taken' 
      });
    }

    // Verify company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }

    // Store password in plain text (not hashed)
    // Create admin
    const admin = await Admin.create({
      fullname,
      username,
      email,
      password: password, // Store as plain text
      originalPassword: originalPassword, // Store original password in plain text
      phone,
      adminArea,
      company,
      created_by: req.user ? req.user.id : "68f210dae0021a8a2431defc" // From auth middleware or default
    });

    // Debug: Log the created admin to see what was actually saved
    console.log('Created admin password:', admin.password);
    console.log('Created admin originalPassword:', admin.originalPassword);
    console.log('Admin object keys:', Object.keys(admin.toObject()));
    console.log('Full admin object:', admin.toObject());
    
    // Debug: Check if the field exists in the database
    const adminFromDB = await Admin.findById(admin._id);
    console.log('Admin from DB password:', adminFromDB.password);
    console.log('Admin from DB originalPassword:', adminFromDB.originalPassword);

    // Return admin data (including originalPassword for SuperAdmin)
    const adminData = {
      _id: admin._id,
      fullname: admin.fullname,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      phone: admin.phone,
      department: admin.department,
      adminArea: admin.adminArea,
      company: admin.company,
      status: admin.status,
      password: admin.password, // Include plain text password
      originalPassword: admin.originalPassword, // Include original password
      createdAt: admin.createdAt
    };

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: adminData
    });
  } catch (err) {
    console.error('Create admin error:', err);
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        message: `${field} already exists` 
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Get all admins controller
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .populate('company', 'company_name company_email')
      .populate('created_by', 'name email');

    // Convert to JSON with password included for SuperAdmin
    const adminsWithPasswords = admins.map(admin => admin.toJSON({ includePassword: true }));

    res.json({
      success: true,
      message: "Admins retrieved successfully",
      data: adminsWithPasswords
    });
  } catch (err) {
    console.error('Get admins error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Get admin by ID controller
exports.getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const admin = await Admin.findById(id)
      .populate('company', 'company_name company_email company_phone')
      .populate('created_by', 'name email');

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    // Convert to JSON with password included for SuperAdmin
    const adminWithPassword = admin.toJSON({ includePassword: true });

    res.json({
      success: true,
      message: "Admin retrieved successfully",
      data: adminWithPassword
    });
  } catch (err) {
    console.error('Get admin error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Update admin controller
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove password from update data if present
    delete updateData.password;

    const admin = await Admin.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    )
    .populate('company', 'company_name company_email')
    .populate('created_by', 'name email')
    .select('-password -resetPasswordToken -resetPasswordExpires');

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    res.json({
      success: true,
      message: "Admin updated successfully",
      data: admin
    });
  } catch (err) {
    console.error('Update admin error:', err);
    
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        message: `${field} already exists` 
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Delete admin controller
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const admin = await Admin.findByIdAndDelete(id);

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    res.json({
      success: true,
      message: "Admin deleted successfully"
    });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Admin Login controller
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

    // Debug: Log the email being searched
    console.log('Searching for admin with email:', email);

    // Find admin by email (case insensitive)
    const admin = await Admin.findOne({ email: email.toLowerCase() }).populate('company', 'company_name company_email');
    
    // Debug: Log if admin was found
    console.log('Admin found:', admin ? 'Yes' : 'No');
    if (admin) {
      console.log('Admin status:', admin.status);
      console.log('Admin email:', admin.email);
    }
    
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if admin is active
    if (admin.status !== 'active') {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is inactive or suspended' 
      });
    }

    // Verify password (plain text comparison)
    const isMatch = password === admin.password;
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check company subscription status
    const subscriptionCheck = await verifyCompanySubscription(admin.company._id);
    if (!subscriptionCheck.isValid) {
      return res.status(403).json({
        success: false,
        message: subscriptionCheck.message,
        code: subscriptionCheck.code || 'SUBSCRIPTION_INACTIVE',
        subscription: subscriptionCheck.subscription
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = signToken({ 
      id: admin._id, 
      role: admin.role, 
      email: admin.email,
      company: admin.company._id 
    });

    // Return admin data (excluding password)
    const adminData = {
      _id: admin._id,
      fullname: admin.fullname,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      phone: admin.phone,
      department: admin.department,
      adminArea: admin.adminArea,
      company: {
        _id: admin.company._id,
        company_name: admin.company.company_name,
        company_email: admin.company.company_email
      },
      status: admin.status,
      lastLogin: admin.lastLogin
    };

    res.json({
      success: true,
      message: "Login successful",
      data: adminData,
      token
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Admin Logout controller
exports.logout = async (req, res) => {
  try {
    // Since JWT is stateless, we can't invalidate the token on the server side
    // The client should remove the token from storage
    // In a more advanced implementation, you could maintain a token blacklist
    
    res.json({
      success: true,
      message: "Logout successful"
    });
  } catch (err) {
    console.error('Admin logout error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Debug: Check all admins (for debugging only)
exports.debugAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('email fullname status password originalPassword');
    console.log('All admins in database:', admins);
    
    res.json({
      success: true,
      message: "Debug: All admins retrieved",
      data: admins
    });
  } catch (err) {
    console.error('Debug admins error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Debug: Delete all admins (for testing only - REMOVE IN PRODUCTION)
exports.deleteAllAdmins = async (req, res) => {
  try {
    const result = await Admin.deleteMany({});
    
    res.json({
      success: true,
      message: "All admins deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Delete all admins error:', err);
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
    const fullUser = await Admin.findById(user.id)
      .populate('company', 'company_name company_email')
      .populate('created_by', 'name email');
    
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
          adminArea: fullUser.adminArea,
          company: fullUser.company,
          created_by: fullUser.created_by,
          status: fullUser.status,
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
