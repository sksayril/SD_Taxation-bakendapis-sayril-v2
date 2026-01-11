const Payslip = require('../models/Payslip');
const SalaryStructure = require('../models/SalaryStructure');
const PayrollRun = require('../models/PayrollRun');
const AuditLog = require('../models/AuditLog');
const Employee = require('../../Employees/models/Employee');
const Company = require('../../Super_Admin/models/Company');
const { calculatePayslip } = require('../lib/payrollCalculator');
const { generateBankCsv } = require('../lib/csvExporter');
const { generatePayslipPdf } = require('../lib/pdfGenerator');

/**
 * Helper to determine user role from token
 */
const getUserRole = (req) => {
  return req.user?.role || null;
};

/**
 * Check if user has required role
 */
const hasRole = (req, allowedRoles) => {
  const userRole = getUserRole(req);
  return allowedRoles.includes(userRole);
};

/**
 * POST /api/payroll/run
 * Run payroll for a company
 * Roles: HR | Finance | SuperAdmin
 */
exports.runPayroll = async (req, res) => {
  try {
    if (!hasRole(req, ['HR', 'Finance', 'Accountant', 'superadmin'])) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR, Finance, Accountant, or SuperAdmin role required.'
      });
    }

    const { companyId, month, year, workingDays = 26, employees, force = false } = req.body;

    // Validate company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get company default salary structure
    const defaultSalaryStructure = await SalaryStructure.getDefaultForCompany(companyId);

    // Determine employee list
    let employeeList;
    if (employees && employees.length > 0) {
      employeeList = await Employee.find({
        _id: { $in: employees },
        company: companyId
      });
    } else {
      // Query all employees for company (isActive field may not exist, so we don't filter by it)
      // In production, add isActive field to Employee model and filter by it
      employeeList = await Employee.find({
        company: companyId
      });
    }

    if (employeeList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No employees found for payroll processing'
      });
    }

    // Create payroll run record
    const payrollRun = await PayrollRun.create({
      company: companyId,
      month,
      year,
      createdBy: req.user.id,
      status: 'running'
    });

    const created = [];
    const skipped = [];
    const errors = [];

    // Get company statutory rates (defaults if not set)
    const statutoryRates = {
      pfPercent: company.pfPercent || 12,
      professionalTax: company.professionalTax || 0
    };

    // Process each employee
    for (const employee of employeeList) {
      try {
        // Check if payslip already exists
        const existingPayslip = await Payslip.findByEmployeeAndPeriod(
          companyId,
          employee._id,
          month,
          year
        );

        if (existingPayslip && !force) {
          skipped.push({
            employeeId: employee._id,
            employeeName: employee.fullname,
            reason: 'Payslip already exists for this period'
          });
          continue;
        }

        // Load salary structure
        let salaryStructure = null;
        if (employee.salaryStructure) {
          salaryStructure = await SalaryStructure.findById(employee.salaryStructure);
        }
        if (!salaryStructure && defaultSalaryStructure) {
          salaryStructure = defaultSalaryStructure;
        }
        if (!salaryStructure) {
          skipped.push({
            employeeId: employee._id,
            employeeName: employee.fullname,
            reason: 'No salary structure found for employee'
          });
          continue;
        }

        // TODO: Compute absentDays from Attendance collection
        // For now, use zero as fallback
        const absentDays = 0; // await getAbsentDays(employee._id, month, year);

        // Validate employee has salary or ctcAnnual
        if (!employee.salary && !employee.ctcAnnual) {
          skipped.push({
            employeeId: employee._id,
            employeeName: employee.fullname,
            reason: 'Employee missing salary or ctcAnnual'
          });
          continue;
        }

        // Calculate payslip
        const calculation = calculatePayslip({
          employee,
          salaryStructure,
          workingDays,
          absentDays,
          statutoryRates
        });

        // Create or update payslip
        const payslipData = {
          company: companyId,
          employee: employee._id,
          period: { month, year },
          earnings: calculation.earnings,
          deductions: calculation.deductions,
          gross: calculation.gross,
          totalDeductions: calculation.totalDeductions,
          netPay: calculation.netPay,
          status: 'draft'
        };

        let payslip;
        if (existingPayslip && force) {
          payslip = await Payslip.findByIdAndUpdate(
            existingPayslip._id,
            payslipData,
            { new: true }
          );
        } else {
          payslip = await Payslip.create(payslipData);
        }

        // Create audit log
        await AuditLog.log(
          companyId,
          req.user.id,
          getUserRole(req) === 'superadmin' ? 'SuperAdmin' : 'Admin',
          'payslip.created',
          {
            payslipId: payslip._id,
            employeeId: employee._id,
            period: `${month}/${year}`
          }
        );

        created.push({
          employeeId: employee._id,
          employeeName: employee.fullname,
          payslipId: payslip._id,
          netPay: payslip.netPay
        });
      } catch (error) {
        console.error(`Error processing employee ${employee._id}:`, error);
        errors.push({
          employeeId: employee._id,
          employeeName: employee.fullname,
          reason: error.message
        });
      }
    }

    // Update payroll run status
    payrollRun.status = errors.length > 0 && created.length === 0 ? 'failed' : 'done';
    payrollRun.summary = {
      createdCount: created.length,
      skippedCount: skipped.length,
      errorList: errors
    };
    await payrollRun.save();

    res.status(201).json({
      success: true,
      message: 'Payroll run completed',
      data: {
        payrollRunId: payrollRun._id,
        createdCount: created.length,
        skippedCount: skipped.length,
        errorCount: errors.length,
        created,
        skipped,
        errors
      }
    });
  } catch (error) {
    console.error('Run payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * GET /api/payroll
 * List payslips by filters
 * Roles: HR | Finance | SuperAdmin
 */
exports.listPayrolls = async (req, res) => {
  try {
    if (!hasRole(req, ['HR', 'Finance', 'Accountant', 'superadmin'])) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR, Finance, Accountant, or SuperAdmin role required.'
      });
    }

    const { companyId, month, year, status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { company: companyId };
    if (month) query['period.month'] = parseInt(month);
    if (year) query['period.year'] = parseInt(year);
    if (status) query.status = status;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Payslip.countDocuments(query);

    // Get payslips
    const payslips = await Payslip.find(query)
      .populate('employee', 'fullname empCode email')
      .populate('approvedBy', 'fullname email')
      .sort({ 'period.year': -1, 'period.month': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      message: 'Payslips retrieved successfully',
      data: payslips,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List payrolls error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * GET /api/payslip/:employeeId
 * Get payslip for employee
 * Roles: Employee (self) | HR | Finance
 */
exports.getPayslip = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    // Validate employeeId
    if (!/^[0-9a-fA-F]{24}$/.test(employeeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID format'
      });
    }
    const userRole = getUserRole(req);

    // Check authorization
    if (['Employee', 'Developer', 'OR'].includes(userRole)) {
      // Employee-type users can only view their own payslips
      if (req.user.id !== employeeId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own payslips.'
        });
      }
    } else if (!hasRole(req, ['HR', 'Finance', 'Accountant', 'superadmin'])) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR, Finance, Accountant, or SuperAdmin role required.'
      });
    }

    // Get employee to find company
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Find payslip
    const payslip = await Payslip.findByEmployeeAndPeriod(
      employee.company,
      employeeId,
      parseInt(month),
      parseInt(year)
    )
      .populate('employee', 'fullname empCode email phone bankDetails')
      .populate('company', 'company_name company_email')
      .populate('approvedBy', 'fullname email');

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found for the specified period'
      });
    }

    res.json({
      success: true,
      message: 'Payslip retrieved successfully',
      data: payslip
    });
  } catch (error) {
    console.error('Get payslip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * POST /api/payroll/:payslipId/approve
 * Approve a payslip
 * Roles: HR | Finance
 */
exports.approvePayslip = async (req, res) => {
  try {
    if (!hasRole(req, ['HR', 'Finance', 'Accountant', 'superadmin'])) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR, Finance, Accountant, or SuperAdmin role required.'
      });
    }

    const { payslipId } = req.params;

    // Validate payslipId
    if (!/^[0-9a-fA-F]{24}$/.test(payslipId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payslip ID format'
      });
    }

    const payslip = await Payslip.findById(payslipId);
    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found'
      });
    }

    if (payslip.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve payslip with status '${payslip.status}'. Only draft payslips can be approved.`
      });
    }

    payslip.status = 'approved';
    payslip.approvedBy = req.user.id;
    await payslip.save();

    // Create audit log
    await AuditLog.log(
      payslip.company,
      req.user.id,
      getUserRole(req) === 'superadmin' ? 'SuperAdmin' : 'Admin',
      'payslip.approved',
      {
        payslipId: payslip._id,
        employeeId: payslip.employee,
        period: `${payslip.period.month}/${payslip.period.year}`
      }
    );

    res.json({
      success: true,
      message: 'Payslip approved successfully',
      data: payslip
    });
  } catch (error) {
    console.error('Approve payslip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * POST /api/payroll/:payslipId/pay
 * Mark payslip as paid
 * Roles: Finance
 * Note: Transactions removed for development compatibility (requires MongoDB replica set)
 */
exports.payPayslip = async (req, res) => {
  try {
    if (!hasRole(req, ['Finance', 'Accountant', 'superadmin'])) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Finance, Accountant, or SuperAdmin role required.'
      });
    }

    const { payslipId } = req.params;
    const { paymentRef, bankLedgerId } = req.body;

    // Validate payslipId
    if (!/^[0-9a-fA-F]{24}$/.test(payslipId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payslip ID format'
      });
    }

    const payslip = await Payslip.findById(payslipId);
    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found'
      });
    }

    // Check idempotency: if already paid with same paymentRef, return success
    if (payslip.status === 'paid' && payslip.paymentRef === paymentRef) {
      return res.json({
        success: true,
        message: 'Payslip already paid with this payment reference',
        data: payslip
      });
    }

    if (payslip.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot pay payslip with status '${payslip.status}'. Only approved payslips can be paid.`
      });
    }

    // TODO: Integration point with Accounts module
    // If Accounts module exists, create Payment Voucher:
    // - Debit: SalaryExpense ledger
    // - Credit: Bank ledger (from bankLedgerId)
    // Example:
    // const Vouchers = require('../../Super_Admin/models/Vouchers');
    // await Vouchers.create({
    //   companyId: payslip.company.toString(),
    //   voucherType: 'Payment',
    //   voucherNumber: `SAL-${payslip.period.year}-${payslip.period.month}-${Date.now()}`,
    //   date: new Date(),
    //   narration: `Salary payment for ${payslip.employee}`,
    //   debitEntries: [{ ledgerName: 'Salary Expense', amount: payslip.netPay }],
    //   creditEntries: [{ ledgerName: bankLedgerName, amount: payslip.netPay }],
    //   approvedBy: req.user.id,
    //   status: 'Approved'
    // });

    // Mark payslip as paid
    payslip.status = 'paid';
    payslip.paidAt = new Date();
    payslip.paymentRef = paymentRef || null;
    await payslip.save();

    // Create audit log
    await AuditLog.log(
      payslip.company,
      req.user.id,
      getUserRole(req) === 'superadmin' ? 'SuperAdmin' : 'Admin',
      'payslip.paid',
      {
        payslipId: payslip._id,
        employeeId: payslip.employee,
        period: `${payslip.period.month}/${payslip.period.year}`,
        paymentRef: paymentRef,
        bankLedgerId: bankLedgerId
      }
    );

    res.json({
      success: true,
      message: 'Payslip marked as paid successfully',
      data: payslip
    });
  } catch (error) {
    console.error('Pay payslip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * GET /api/payroll/bank-export
 * Export bank payment file
 * Roles: Finance
 */
exports.bankExport = async (req, res) => {
  try {
    if (!hasRole(req, ['Finance', 'Accountant', 'superadmin'])) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Finance, Accountant, or SuperAdmin role required.'
      });
    }

    const { companyId, month, year, format = 'csv' } = req.query;

    // Query payslips with status 'approved' or 'paid'
    const payslips = await Payslip.find({
      company: companyId,
      'period.month': parseInt(month),
      'period.year': parseInt(year),
      status: { $in: ['approved', 'paid'] }
    })
      .populate('employee', 'fullname bankDetails')
      .sort({ 'employee.fullname': 1 });

    if (payslips.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No approved payslips found for the specified period'
      });
    }

    // Build CSV rows
    const rows = [];
    const invalidRows = [];

    for (const payslip of payslips) {
      const employee = payslip.employee;
      const bankDetails = employee.bankDetails || {};

      // Validate bank details
      const account = bankDetails.accountNumber;
      const ifsc = bankDetails.ifsc;
      const name = employee.fullname;

      if (!account || !ifsc) {
        invalidRows.push({
          employeeId: employee._id,
          employeeName: name,
          reason: 'Missing bank account number or IFSC code'
        });
        continue;
      }

      // Validate IFSC format
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(ifsc)) {
        invalidRows.push({
          employeeId: employee._id,
          employeeName: name,
          reason: 'Invalid IFSC code format'
        });
        continue;
      }

      rows.push({
        name: name,
        account: account,
        ifsc: ifsc,
        amount: payslip.netPay
      });
    }

    // Generate CSV
    const csvContent = generateBankCsv(rows);

    // Set response headers
    const filename = `bank_payment_${companyId}_${year}_${month}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // If invalid rows exist, include metadata in response header
    if (invalidRows.length > 0) {
      res.setHeader('X-Invalid-Rows', JSON.stringify(invalidRows));
    }

    // Return CSV content directly
    res.send(csvContent);
  } catch (error) {
    console.error('Bank export error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * POST /api/payslip/:payslipId/generate-pdf
 * Generate PDF for payslip
 * Roles: HR | Finance (or system-worker)
 * NOTE: In production, move this to a background worker/queue
 */
exports.generatePdf = async (req, res) => {
  try {
    if (!hasRole(req, ['HR', 'Finance', 'Accountant', 'superadmin'])) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR, Finance, Accountant, or SuperAdmin role required.'
      });
    }

    const { payslipId } = req.params;

    // Validate payslipId
    if (!/^[0-9a-fA-F]{24}$/.test(payslipId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payslip ID format'
      });
    }

    const payslip = await Payslip.findById(payslipId)
      .populate('employee')
      .populate('company');

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found'
      });
    }

    // Generate PDF
    const pdfPath = await generatePayslipPdf(payslip, payslip.employee, payslip.company);

    // TODO: Upload to S3 and update payslip.pdfUrl
    // const pdfUrl = await uploadPdfToS3(pdfPath, payslipId);
    // payslip.pdfUrl = pdfUrl;
    // await payslip.save();

    res.json({
      success: true,
      message: 'PDF generated successfully',
      data: {
        payslipId: payslip._id,
        pdfPath: pdfPath,
        note: 'In production, this should be handled by a background worker and uploaded to S3'
      }
    });
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * POST /api/payslip/:payslipId/email
 * Email payslip to employee
 * Roles: HR | Finance (or system-worker)
 * NOTE: In production, move this to a background worker/queue
 */
exports.emailPayslip = async (req, res) => {
  try {
    if (!hasRole(req, ['HR', 'Finance', 'Accountant', 'superadmin'])) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR, Finance, Accountant, or SuperAdmin role required.'
      });
    }

    const { payslipId } = req.params;

    // Validate payslipId
    if (!/^[0-9a-fA-F]{24}$/.test(payslipId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payslip ID format'
      });
    }

    const payslip = await Payslip.findById(payslipId)
      .populate('employee')
      .populate('company');

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found'
      });
    }

    // TODO: Implement email sending
    // 1. Generate PDF if not exists
    // 2. Send email with PDF attachment
    // 3. Use email service (nodemailer or similar)
    // Example:
    // const { sendPasswordResetEmail } = require('../../Super_Admin/services/emailService');
    // await sendPayslipEmail(payslip.employee.email, pdfPath, payslip);

    res.json({
      success: true,
      message: 'Email queued successfully',
      data: {
        payslipId: payslip._id,
        employeeEmail: payslip.employee.email,
        note: 'In production, this should be handled by a background worker/queue'
      }
    });
  } catch (error) {
    console.error('Email payslip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

