const PayrollVoucher = require('../models/PayrollVoucher');
const Employee = require('../../Employees/models/Employee');
const Company = require('../models/Company');

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Helper function to calculate net pay
const calculateNetPay = (grossSalary, deductions) => {
  const totalDeductions = Object.values(deductions || {}).reduce((sum, value) => {
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
  return grossSalary - totalDeductions;
};

// ✅ Create Payroll Voucher
exports.createPayrollVoucher = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { 
      companyId, 
      empCode, 
      month, 
      year, 
      grossSalary, 
      deductions = {}, 
      netPay,
      paymentVoucherNo,
      status = 'Draft',
      remarks 
    } = req.body;

    // Calculate net pay if not provided
    const calculatedNetPay = netPay || calculateNetPay(grossSalary, deductions);

    // Check if payroll already exists for this employee and period
    const existingPayroll = await PayrollVoucher.findOne({
      companyId,
      empCode,
      month,
      year
    });

    if (existingPayroll) {
      return res.status(400).json({ 
        success: false, 
        message: `Payroll already exists for employee ${empCode} for ${month}/${year}` 
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

    // Verify employee exists
    const employee = await Employee.findOne({ 
      empCode: empCode,
      company: companyId 
    });
    
    if (!employee) {
      return res.status(400).json({ 
        success: false, 
        message: `Employee with code ${empCode} not found in company ${companyId}` 
      });
    }

    // Generate payment voucher number if not provided
    let finalPaymentVoucherNo = paymentVoucherNo;
    if (!finalPaymentVoucherNo) {
      finalPaymentVoucherNo = await PayrollVoucher.generatePaymentVoucherNo(year);
    }

    // Create payroll voucher
    const payrollVoucher = await PayrollVoucher.create({
      companyId,
      empCode,
      month,
      year,
      grossSalary,
      deductions,
      netPay: calculatedNetPay,
      paymentVoucherNo: finalPaymentVoucherNo,
      status,
      remarks,
      createdBy: req.user ? req.user.id : null
    });

    res.status(201).json({
      success: true,
      message: 'Payroll voucher created successfully',
      data: payrollVoucher
    });

  } catch (err) {
    console.error('Create Payroll Voucher error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};

// ✅ Get All Payroll Vouchers
exports.getAllPayrollVouchers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      empCode, 
      year, 
      month, 
      status,
      companyId 
    } = req.query;

    // Build query
    let query = {};
    
    if (companyId) {
      query.companyId = companyId;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { empCode: { $regex: search, $options: 'i' } },
        { paymentVoucherNo: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by employee code
    if (empCode) {
      query.empCode = empCode;
    }

    // Filter by year
    if (year) {
      query.year = year;
    }

    // Filter by month
    if (month) {
      query.month = month;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await PayrollVoucher.countDocuments(query);
    
    const payrollVouchers = await PayrollVoucher.find(query)
      .populate('createdBy', 'fullname email')
      .populate('approvedBy', 'fullname email')
      .sort({ year: -1, month: -1, empCode: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      message: 'Payroll vouchers retrieved successfully',
      data: payrollVouchers,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    console.error('Get All Payroll Vouchers error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// ✅ Get Payroll Voucher by ID
exports.getPayrollVoucherById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payroll voucher ID format' 
      });
    }

    const payrollVoucher = await PayrollVoucher.findById(id)
      .populate('createdBy', 'fullname email')
      .populate('approvedBy', 'fullname email');

    if (!payrollVoucher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payroll voucher not found' 
      });
    }

    res.json({
      success: true,
      message: 'Payroll voucher retrieved successfully',
      data: payrollVoucher
    });

  } catch (err) {
    console.error('Get Payroll Voucher by ID error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// ✅ Update Payroll Voucher
exports.updatePayrollVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payroll voucher ID format' 
      });
    }

    const existingPayroll = await PayrollVoucher.findById(id);
    if (!existingPayroll) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payroll voucher not found' 
      });
    }

    // Don't allow updates if status is 'Paid' or 'Cancelled'
    if (existingPayroll.status === 'Paid' || existingPayroll.status === 'Cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot update payroll voucher with status '${existingPayroll.status}'` 
      });
    }

    const updateData = { ...req.body };

    // Recalculate net pay if gross salary or deductions are updated
    if (updateData.grossSalary || updateData.deductions) {
      const grossSalary = updateData.grossSalary || existingPayroll.grossSalary;
      const deductions = { ...existingPayroll.deductions, ...updateData.deductions };
      updateData.netPay = calculateNetPay(grossSalary, deductions);
    }

    // Set approved by when status changes to 'Approved'
    if (updateData.status === 'Approved' && !updateData.approvedBy) {
      updateData.approvedBy = req.user ? req.user.id : null;
    }

    const payrollVoucher = await PayrollVoucher.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('createdBy', 'fullname email')
     .populate('approvedBy', 'fullname email');

    res.json({
      success: true,
      message: 'Payroll voucher updated successfully',
      data: payrollVoucher
    });

  } catch (err) {
    console.error('Update Payroll Voucher error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};

// ✅ Delete Payroll Voucher
exports.deletePayrollVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payroll voucher ID format' 
      });
    }

    const existingPayroll = await PayrollVoucher.findById(id);
    if (!existingPayroll) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payroll voucher not found' 
      });
    }

    // Don't allow deletion if status is 'Paid'
    if (existingPayroll.status === 'Paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete paid payroll voucher' 
      });
    }

    await PayrollVoucher.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Payroll voucher deleted successfully'
    });

  } catch (err) {
    console.error('Delete Payroll Voucher error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// ✅ Get Payroll by Employee and Period
exports.getPayrollByEmployee = async (req, res) => {
  try {
    const { companyId, empCode, year, month } = req.query;

    if (!companyId || !empCode || !year || !month) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company ID, Employee Code, Year, and Month are required' 
      });
    }

    const payroll = await PayrollVoucher.getPayrollByEmployee(companyId, empCode, year, month);

    if (!payroll) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payroll not found for the specified employee and period' 
      });
    }

    res.json({
      success: true,
      message: 'Payroll retrieved successfully',
      data: payroll
    });

  } catch (err) {
    console.error('Get Payroll by Employee error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// ✅ Get Payroll by Period
exports.getPayrollByPeriod = async (req, res) => {
  try {
    const { companyId, year, month, page = 1, limit = 20 } = req.query;

    if (!companyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company ID is required' 
      });
    }

    const result = await PayrollVoucher.getPayrollByPeriod(companyId, year, month, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      message: 'Payroll by period retrieved successfully',
      data: result.payrolls,
      meta: result.pagination
    });

  } catch (err) {
    console.error('Get Payroll by Period error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// ✅ Bulk Create Payroll Vouchers
exports.bulkCreatePayrollVouchers = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { companyId, year, month, payrolls } = req.body;

    // Verify company exists
    const companyExists = await Company.findById(companyId);
    if (!companyExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }

    const createdPayrolls = [];
    const errors = [];

    for (let i = 0; i < payrolls.length; i++) {
      try {
        const payroll = payrolls[i];
        const { empCode, grossSalary, deductions = {}, remarks } = payroll;

        // Check if payroll already exists
        const existingPayroll = await PayrollVoucher.findOne({
          companyId,
          empCode,
          month,
          year
        });

        if (existingPayroll) {
          errors.push({
            index: i,
            empCode,
            error: `Payroll already exists for employee ${empCode} for ${month}/${year}`
          });
          continue;
        }

        // Verify employee exists
        const employee = await Employee.findOne({ 
          empCode: empCode,
          company: companyId 
        });
        
        if (!employee) {
          errors.push({
            index: i,
            empCode,
            error: `Employee with code ${empCode} not found in company ${companyId}`
          });
          continue;
        }

        // Calculate net pay
        const netPay = calculateNetPay(grossSalary, deductions);

        // Generate payment voucher number
        const paymentVoucherNo = await PayrollVoucher.generatePaymentVoucherNo(year);

        // Create payroll voucher
        const payrollVoucher = await PayrollVoucher.create({
          companyId,
          empCode,
          month,
          year,
          grossSalary,
          deductions,
          netPay,
          paymentVoucherNo,
          status: 'Draft',
          remarks,
          createdBy: req.user ? req.user.id : null
        });

        createdPayrolls.push(payrollVoucher);

      } catch (error) {
        errors.push({
          index: i,
          empCode: payrolls[i].empCode,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Bulk payroll creation completed. ${createdPayrolls.length} created, ${errors.length} errors`,
      data: {
        created: createdPayrolls,
        errors: errors
      }
    });

  } catch (err) {
    console.error('Bulk Create Payroll Vouchers error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};

// ✅ Generate Payment Voucher Number
exports.generatePaymentVoucherNumber = async (req, res) => {
  try {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ 
        success: false, 
        message: 'Year is required' 
      });
    }

    const paymentVoucherNo = await PayrollVoucher.generatePaymentVoucherNo(year);

    res.json({
      success: true,
      message: 'Payment voucher number generated successfully',
      data: {
        paymentVoucherNo
      }
    });

  } catch (err) {
    console.error('Generate Payment Voucher Number error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// ✅ Get Payroll Summary
exports.getPayrollSummary = async (req, res) => {
  try {
    const { companyId, year, month } = req.query;

    if (!companyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company ID is required' 
      });
    }

    let query = { companyId };
    if (year) query.year = year;
    if (month) query.month = month;

    const payrolls = await PayrollVoucher.find(query);

    const summary = {
      totalEmployees: payrolls.length,
      totalGrossSalary: payrolls.reduce((sum, p) => sum + p.grossSalary, 0),
      totalDeductions: payrolls.reduce((sum, p) => sum + p.getTotalDeductions(), 0),
      totalNetPay: payrolls.reduce((sum, p) => sum + p.netPay, 0),
      statusBreakdown: {
        Draft: payrolls.filter(p => p.status === 'Draft').length,
        Approved: payrolls.filter(p => p.status === 'Approved').length,
        Paid: payrolls.filter(p => p.status === 'Paid').length,
        Cancelled: payrolls.filter(p => p.status === 'Cancelled').length
      },
      deductionBreakdown: {
        pf: payrolls.reduce((sum, p) => sum + (p.deductions.pf || 0), 0),
        esi: payrolls.reduce((sum, p) => sum + (p.deductions.esi || 0), 0),
        tax: payrolls.reduce((sum, p) => sum + (p.deductions.tax || 0), 0),
        other: payrolls.reduce((sum, p) => sum + (p.deductions.other || 0), 0)
      }
    };

    res.json({
      success: true,
      message: 'Payroll summary retrieved successfully',
      data: summary
    });

  } catch (err) {
    console.error('Get Payroll Summary error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
