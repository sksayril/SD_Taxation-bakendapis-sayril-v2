const Employee = require('../models/Employee');
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

// Helper function to filter password from employee data
const filterEmployeeData = (employee) => {
  const employeeObj = employee.toObject ? employee.toObject() : employee;
  delete employeeObj.password;
  return employeeObj;
};

// ✅ Create Employee controller
exports.createEmployee = async (req, res) => {
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
      email, 
      password, 
      phone, 
      department, 
      designation, 
      empCode,
      salary,
      bankDetails,
      aadharId,
      panNo,
      joinDate,
      address, 
      company 
    } = req.body;

    // Validate company ObjectId
    if (!isValidObjectId(company)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid company ID format' 
      });
    }

    // Check if email already exists
    const existingEmail = await Employee.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Check if employee code already exists
    if (empCode) {
      const existingEmpCode = await Employee.findOne({ empCode: empCode.toUpperCase() });
      if (existingEmpCode) {
        return res.status(400).json({ 
          success: false, 
          message: 'Employee code already exists' 
        });
      }
    }

    // Check if Aadhar ID already exists (if provided)
    if (aadharId) {
      const existingAadhar = await Employee.findOne({ aadharId });
      if (existingAadhar) {
        return res.status(400).json({ 
          success: false, 
          message: 'Aadhar ID already exists' 
        });
      }
    }

    // Check if PAN number already exists (if provided)
    if (panNo) {
      const existingPAN = await Employee.findOne({ panNo: panNo.toUpperCase() });
      if (existingPAN) {
        return res.status(400).json({ 
          success: false, 
          message: 'PAN number already exists' 
        });
      }
    }

    // Verify company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }

    // Prepare employee data (explicitly exclude username and other unwanted fields)
    const employeeData = {
      fullname,
      email: email.toLowerCase(),
      password,
      phone,
      department,
      designation,
      empCode: empCode ? empCode.toUpperCase() : empCode,
      salary,
      bankDetails,
      aadharId,
      panNo: panNo ? panNo.toUpperCase() : panNo,
      joinDate,
      address,
      company,
      createdBy: req.user ? req.user.id : "68f210dae0021a8a2431defc" // From auth middleware or default
    };

    // Explicitly remove username if it exists (Employee model doesn't use username)
    delete employeeData.username;

    // Debug: Log the data being saved
    console.log('Creating employee with data:', employeeData);

    // Create employee
    const employee = await Employee.create(employeeData);

    // Debug: Log the created employee password
    console.log('Created employee password:', employee.password);

    // Return employee data (excluding password)
    const filteredEmployeeData = filterEmployeeData(employee);

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: filteredEmployeeData
    });
  } catch (err) {
    console.error('Create employee error:', err);
    console.error('Error details:', {
      code: err.code,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue,
      message: err.message
    });
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const fieldValue = err.keyValue ? err.keyValue[field] : 'unknown';
      let message = '';
      
      switch(field) {
        case 'email':
          message = 'Email already exists';
          break;
        case 'empCode':
          message = 'Employee code already exists';
          break;
        case 'aadharId':
          message = 'Aadhar ID already exists';
          break;
        case 'panNo':
          message = 'PAN number already exists';
          break;
        case 'employeeId':
          message = 'Employee ID already exists';
          break;
        case 'username':
          // Username field shouldn't exist for Employee model
          // This likely means there's a unique index on username in the database
          // Check if it's actually email or empCode causing the issue
          message = `A record with this information already exists. Please check email, employee code, Aadhar ID, or PAN number.`;
          break;
        default:
          message = `${field} already exists${fieldValue ? ` (value: ${fieldValue})` : ''}`;
      }
      
      return res.status(400).json({ 
        success: false, 
        message,
        field: field,
        details: `Duplicate key error on field: ${field}`
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Get Employees controller with pagination and search
exports.getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const department = req.query.department || '';

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by department
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }


    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get employees with pagination (include password for Admin/SuperAdmin)
    const employees = await Employee.find(query)
      .populate('company', 'company_name company_email')
      .populate('createdBy', 'fullname email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Employee.countDocuments(query);
    const pages = Math.ceil(total / limit);

    // Convert to JSON with password included for Admin/SuperAdmin
    const employeesWithPasswords = employees.map(employee => employee.toJSON({ includePassword: true }));

    res.json({
      success: true,
      message: "Employees retrieved successfully",
      data: employeesWithPasswords,
      meta: {
        total,
        page,
        limit,
        pages
      }
    });
  } catch (err) {
    console.error('Get employees error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Get Employee by ID controller
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid employee ID format' 
      });
    }
    
    const employee = await Employee.findById(id)
      .populate('company', 'company_name company_email company_phone')
      .populate('createdBy', 'fullname email');

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    // Convert to JSON with password included for Admin/SuperAdmin
    const employeeWithPassword = employee.toJSON({ includePassword: true });

    res.json({
      success: true,
      message: "Employee retrieved successfully",
      data: employeeWithPassword
    });
  } catch (err) {
    console.error('Get employee error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Update Employee controller
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid employee ID format' 
      });
    }

    const updateData = req.body;

    // Check if employee exists
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    // Check for duplicate email if email is being updated
    if (updateData.email && updateData.email !== existingEmployee.email) {
      const emailExists = await Employee.findOne({ 
        email: updateData.email.toLowerCase(),
        _id: { $ne: id }
      });
      if (emailExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }
      updateData.email = updateData.email.toLowerCase();
    }



    // Update employee
    const employee = await Employee.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    )
    .populate('company', 'company_name company_email')
    .populate('createdBy', 'fullname email')
    .select('-password');

    res.json({
      success: true,
      message: "Employee updated successfully",
      data: employee
    });
  } catch (err) {
    console.error('Update employee error:', err);
    
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

// ✅ Delete Employee controller
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid employee ID format' 
      });
    }
    
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    res.json({
      success: true,
      message: "Employee deleted successfully"
    });
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Employee Login controller
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

    // Find employee by email
    const employee = await Employee.findOne({ email: email.toLowerCase() }).populate('company', 'company_name company_email');
    if (!employee) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }


    // Verify password
    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check company subscription status
    const subscriptionCheck = await verifyCompanySubscription(employee.company._id);
    if (!subscriptionCheck.isValid) {
      return res.status(403).json({
        success: false,
        message: subscriptionCheck.message,
        code: subscriptionCheck.code || 'SUBSCRIPTION_INACTIVE',
        subscription: subscriptionCheck.subscription
      });
    }

    // Update last login
    employee.lastLogin = new Date();
    await employee.save();

    // Generate JWT token
    const token = signToken({ 
      id: employee._id, 
      role: employee.role, 
      email: employee.email,
      company: employee.company._id 
    });

    // Return employee data (excluding password)
    const employeeData = filterEmployeeData(employee);

    res.json({
      success: true,
      message: "Login successful",
      data: employeeData,
      token
    });
  } catch (err) {
    console.error('Employee login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Employee Logout controller
exports.logout = async (req, res) => {
  try {
    // Since JWT is stateless, we can't invalidate the token on the server side
    // The client should remove the token from storage
    
    res.json({
      success: true,
      message: "Logout successful"
    });
  } catch (err) {
    console.error('Employee logout error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Debug: Check all employees (for debugging only)
exports.debugEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('email fullname password');
    console.log('All employees in database:', employees);
    
    res.json({
      success: true,
      message: "Debug: All employees retrieved",
      data: employees
    });
  } catch (err) {
    console.error('Debug employees error:', err);
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
    const fullUser = await Employee.findById(user.id)
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
