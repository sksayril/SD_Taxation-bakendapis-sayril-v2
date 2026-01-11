const SuperAdmin = require('../models/SuperAdmin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateResetToken, hashToken, sendPasswordResetEmail } = require('../services/emailService');

// helper: token generator
const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'change-me';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

// ✅ Signup controller
exports.signup = async (req, res) => {
  try {
    // Defensive check for req.body
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { name, email, password } = req.body;

    // check existing admin
    const existing = await SuperAdmin.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const admin = await SuperAdmin.create({ name, email, password: hashed });

    const token = signToken({ id: admin._id, role: admin.role, email: admin.email });

    res.status(201).json({
      success: true,
      data: { id: admin._id, name: admin.name, email: admin.email },
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Login controller
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

    const admin = await SuperAdmin.findOne({ email });
    if (!admin)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken({ id: admin._id, role: admin.role, email: admin.email });

    res.json({
      success: true,
      message: "Login Successfully",
      data: { id: admin._id, name: admin.name, email: admin.email },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Logout controller
exports.logout = async (req, res) => {
  try {
    // Since JWT is stateless, we can't invalidate the token on the server side
    // The client should remove the token from storage
    // In a more advanced implementation, you could maintain a token blacklist
    
    res.json({
      success: true,
      message: "Logout Successfully"
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Forget Password controller
exports.forgetPassword = async (req, res) => {
  try {
    // Defensive check for req.body
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { email } = req.body;

    // Check if admin exists
    const admin = await SuperAdmin.findOne({ email });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found with this email"
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);
    
    // Set token and expiration (1 hour from now)
    admin.resetPasswordToken = hashedToken;
    admin.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await admin.save();

    // Return the reset token directly (for testing/development)
    res.json({
      success: true,
      message: "Password reset token generated successfully",
      resetToken: resetToken, // Return token for testing
      expiresIn: "1 hour"
    });
  } catch (err) {
    console.error('Forget password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Change Password controller
exports.changePassword = async (req, res) => {
  try {
    // Defensive check for req.body
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id; // From auth middleware

    // Find admin
    const admin = await SuperAdmin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    admin.password = hashedNewPassword;
    await admin.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Reset Password controller
exports.resetPassword = async (req, res) => {
  try {
    // Defensive check for req.body
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { token, newPassword } = req.body;

    // Hash the provided token to compare with stored hash
    const hashedToken = hashToken(token);

    // Find admin with valid token and not expired
    const admin = await SuperAdmin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    admin.password = hashedPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.json({
      success: true,
      message: "Password reset successfully",
      data: {
        email: admin.email,
        name: admin.name
      }
    });
  } catch (err) {
    console.error('Reset password error:', err);
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
    const fullUser = await SuperAdmin.findById(user.id);
    
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
          name: fullUser.name,
          email: fullUser.email,
          role: fullUser.role,
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