const jwt = require('jsonwebtoken');

// General authentication middleware
module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization') || req.header('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'change-me';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Admin verification middleware (Admin or SuperAdmin)
module.exports.verifyAdmin = (req, res, next) => {
  const authHeader = req.header('Authorization') || req.header('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'change-me';
    const decoded = jwt.verify(token, secret);
    
    // Check if user is Admin or SuperAdmin
    if (decoded.role !== 'Admin' && decoded.role !== 'superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin or SuperAdmin role required.' 
      });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
