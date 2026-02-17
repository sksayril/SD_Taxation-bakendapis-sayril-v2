const Department = require('../models/Department');

// ✅ Create Department
exports.createDepartment = async (req, res) => {
  try {
    // Defensive check for req.body
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { department_name, description, status } = req.body;

    // Check if department with same name already exists
    const existingDepartment = await Department.findOne({ 
      department_name: department_name.trim() 
    });
    
    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    // Create new department
    const department = await Department.create({
      department_name: department_name.trim(),
      description: description ? description.trim() : null,
      status: status || 'active',
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    console.error('Error creating department:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ✅ Get All Departments
exports.getAllDepartments = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 100 } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Search by department name or description
    if (search) {
      query.$or = [
        { department_name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get departments with pagination
    const departments = await Department.find(query)
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    // Get total count
    const total = await Department.countDocuments(query);
    
    res.status(200).json({
      success: true,
      message: 'Departments retrieved successfully',
      data: departments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error getting departments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ✅ Update Department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { department_name, description, status } = req.body;

    // Check if department exists
    const existingDepartment = await Department.findById(id);
    if (!existingDepartment) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // If updating department_name, check for uniqueness
    if (department_name && department_name.trim() !== existingDepartment.department_name) {
      const duplicateDepartment = await Department.findOne({
        department_name: department_name.trim(),
        _id: { $ne: id }
      });
      
      if (duplicateDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Department with this name already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (department_name !== undefined) {
      updateData.department_name = department_name.trim();
    }
    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    // Update department
    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('created_by', 'name email');

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: updatedDepartment
    });
  } catch (error) {
    console.error('Error updating department:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID format'
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ✅ Delete Department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department exists
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department is being used by any admins
    const Admin = require('../../Admin/models/Admin');
    const adminUsingDepartment = await Admin.findOne({ department: id });
    
    if (adminUsingDepartment) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department '${department.department_name}' because it is assigned to one or more admins. Please reassign or remove those admins first.`
      });
    }

    // Check if department is being used by any employees
    const Employee = require('../../Employees/models/Employee');
    const employeeUsingDepartment = await Employee.findOne({ department: department.department_name });
    
    if (employeeUsingDepartment) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department '${department.department_name}' because it is assigned to one or more employees. Please reassign or remove those employees first.`
      });
    }

    // Delete department
    await Department.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
      data: {
        _id: department._id,
        department_name: department.department_name
      }
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid department ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
