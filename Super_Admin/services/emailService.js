const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.MAILTRAP_HOST || 'smtp.mailtrap.io',
    port: process.env.MAILTRAP_PORT || 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    }
  });
};

// Generate secure reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash token with SHA256
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, adminName) => {
  try {
    const transporter = createTransporter();
    
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@sd-taxation.com',
      to: email,
      subject: 'Password Reset Request - SD Taxation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${adminName},</p>
          <p>You have requested to reset your password for your SD Taxation Super Admin account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetURL}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this URL into your browser:<br>
            <a href="${resetURL}">${resetURL}</a>
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateResetToken,
  hashToken,
  sendPasswordResetEmail
};
