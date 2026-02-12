const HR = require('../../HR/models/HR');
const Employee = require('../../Employees/models/Employee');
const CRM = require('../../CRM/models/CRM');
const ERP = require('../../ERP/models/ERP');
const Payslip = require('../../HR/models/Payslip');
const Admin = require('../models/Admin');

/**
 * HRM Module Management
 */

// Update HR User
exports.updateHRMUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.originalPassword;

    const hrUser = await HR.findOneAndUpdate(
      { _id: id, company: req.user.company },
      updateData,
      { new: true, runValidators: true }
    ).populate('company', 'company_name');

    if (!hrUser) {
      return res.status(404).json({
        success: false,
        message: 'HR user not found'
      });
    }

    res.json({
      success: true,
      message: 'HR user updated successfully',
      data: hrUser
    });
  } catch (error) {
    console.error('Update HRM user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete HR User
exports.deleteHRMUser = async (req, res) => {
  try {
    const { id } = req.params;

    const hrUser = await HR.findOneAndDelete({ _id: id, company: req.user.company });

    if (!hrUser) {
      return res.status(404).json({
        success: false,
        message: 'HR user not found'
      });
    }

    res.json({
      success: true,
      message: 'HR user deleted successfully'
    });
  } catch (error) {
    console.error('Delete HRM user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update Employee
exports.updateHRMEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.originalPassword;

    const employee = await Employee.findOneAndUpdate(
      { _id: id, company: req.user.company },
      updateData,
      { new: true, runValidators: true }
    ).populate('company', 'company_name');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Update HRM employee error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete Employee
exports.deleteHRMEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOneAndDelete({ _id: id, company: req.user.company });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete HRM employee error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * CRM Module Management
 */

// Update CRM Record
exports.updateCRMRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_by = req.user.id;

    const crmRecord = await CRM.findOneAndUpdate(
      { _id: id, company: req.user.company },
      updateData,
      { new: true, runValidators: true }
    )
    .populate('created_by', 'fullname email')
    .populate('updated_by', 'fullname email');

    if (!crmRecord) {
      return res.status(404).json({
        success: false,
        message: 'CRM record not found'
      });
    }

    res.json({
      success: true,
      message: 'CRM record updated successfully',
      data: crmRecord
    });
  } catch (error) {
    console.error('Update CRM record error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete CRM Record
exports.deleteCRMRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const crmRecord = await CRM.findOneAndDelete({ _id: id, company: req.user.company });

    if (!crmRecord) {
      return res.status(404).json({
        success: false,
        message: 'CRM record not found'
      });
    }

    res.json({
      success: true,
      message: 'CRM record deleted successfully'
    });
  } catch (error) {
    console.error('Delete CRM record error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * ERP Module Management
 */

// Update ERP Record
exports.updateERPRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_by = req.user.id;

    const erpRecord = await ERP.findOneAndUpdate(
      { _id: id, company: req.user.company },
      updateData,
      { new: true, runValidators: true }
    )
    .populate('created_by', 'fullname email')
    .populate('updated_by', 'fullname email');

    if (!erpRecord) {
      return res.status(404).json({
        success: false,
        message: 'ERP record not found'
      });
    }

    res.json({
      success: true,
      message: 'ERP record updated successfully',
      data: erpRecord
    });
  } catch (error) {
    console.error('Update ERP record error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete ERP Record
exports.deleteERPRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const erpRecord = await ERP.findOneAndDelete({ _id: id, company: req.user.company });

    if (!erpRecord) {
      return res.status(404).json({
        success: false,
        message: 'ERP record not found'
      });
    }

    res.json({
      success: true,
      message: 'ERP record deleted successfully'
    });
  } catch (error) {
    console.error('Delete ERP record error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Payroll Module Management
 */

// Update Payslip
exports.updatePayrollPayslip = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const payslip = await Payslip.findOneAndUpdate(
      { _id: id, company: req.user.company },
      updateData,
      { new: true, runValidators: true }
    )
    .populate('employee', 'fullname email empCode')
    .populate('company', 'company_name');

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found'
      });
    }

    res.json({
      success: true,
      message: 'Payslip updated successfully',
      data: payslip
    });
  } catch (error) {
    console.error('Update payroll payslip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete Payslip
exports.deletePayrollPayslip = async (req, res) => {
  try {
    const { id } = req.params;

    const payslip = await Payslip.findOneAndDelete({ _id: id, company: req.user.company });

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found'
      });
    }

    res.json({
      success: true,
      message: 'Payslip deleted successfully'
    });
  } catch (error) {
    console.error('Delete payroll payslip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Admin Permission Management (SuperAdmin only)
 */

// Update Admin Permissions
exports.updateAdminPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!permissions) {
      return res.status(400).json({
        success: false,
        message: 'Permissions object is required'
      });
    }

    const admin = await Admin.findByIdAndUpdate(
      id,
      { $set: { permissions } },
      { new: true, runValidators: true }
    )
    .populate('company', 'company_name')
    .populate('created_by', 'name email');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin permissions updated successfully',
      data: admin
    });
  } catch (error) {
    console.error('Update admin permissions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get Admin Permissions
exports.getAdminPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id)
      .select('permissions fullname email role company')
      .populate('company', 'company_name');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin permissions retrieved successfully',
      data: {
        admin: {
          _id: admin._id,
          fullname: admin.fullname,
          email: admin.email,
          role: admin.role,
          company: admin.company
        },
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error('Get admin permissions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
