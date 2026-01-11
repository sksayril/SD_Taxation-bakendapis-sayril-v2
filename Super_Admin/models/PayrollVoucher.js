const mongoose = require('mongoose');

const PayrollVoucherSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: [true, 'Company ID is required'],
    trim: true,
    match: [/^[0-9a-fA-F]{24}$/, 'Company ID must be a valid MongoDB ObjectId']
  },
  empCode: {
    type: String,
    required: [true, 'Employee code is required'],
    trim: true,
    minlength: [3, 'Employee code must be at least 3 characters'],
    maxlength: [20, 'Employee code cannot exceed 20 characters'],
    match: [/^[A-Z0-9]+$/, 'Employee code can only contain uppercase letters and numbers']
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    trim: true,
    match: [/^(0[1-9]|1[0-2])$/, 'Month must be between 01 and 12'],
    validate: {
      validator: function(v) {
        return parseInt(v) >= 1 && parseInt(v) <= 12;
      },
      message: 'Month must be between 01 and 12'
    }
  },
  year: {
    type: String,
    required: [true, 'Year is required'],
    trim: true,
    match: [/^(19|20)\d{2}$/, 'Year must be a valid 4-digit year'],
    validate: {
      validator: function(v) {
        const year = parseInt(v);
        const currentYear = new Date().getFullYear();
        return year >= 2000 && year <= currentYear + 1;
      },
      message: 'Year must be between 2000 and next year'
    }
  },
  grossSalary: {
    type: Number,
    required: [true, 'Gross salary is required'],
    min: [0, 'Gross salary cannot be negative'],
    max: [99999999, 'Gross salary cannot exceed 99,999,999']
  },
  deductions: {
    pf: {
      type: Number,
      default: 0,
      min: [0, 'PF deduction cannot be negative'],
      max: [9999999, 'PF deduction cannot exceed 9,999,999']
    },
    esi: {
      type: Number,
      default: 0,
      min: [0, 'ESI deduction cannot be negative'],
      max: [9999999, 'ESI deduction cannot exceed 9,999,999']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax deduction cannot be negative'],
      max: [9999999, 'Tax deduction cannot exceed 9,999,999']
    },
    other: {
      type: Number,
      default: 0,
      min: [0, 'Other deductions cannot be negative'],
      max: [9999999, 'Other deductions cannot exceed 9,999,999']
    }
  },
  netPay: {
    type: Number,
    required: [true, 'Net pay is required'],
    min: [0, 'Net pay cannot be negative'],
    max: [99999999, 'Net pay cannot exceed 99,999,999']
  },
  paymentVoucherNo: {
    type: String,
    required: [true, 'Payment voucher number is required'],
    trim: true,
    unique: true,
    match: [/^SAL\/\d{4}\/\d{3}$/, 'Payment voucher number must be in format SAL/YYYY/XXX']
  },
  status: {
    type: String,
    enum: {
      values: ['Draft', 'Approved', 'Paid', 'Cancelled'],
      message: 'Status must be one of: Draft, Approved, Paid, Cancelled'
    },
    default: 'Draft'
  },
  paymentDate: {
    type: Date,
    default: null
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, {
  timestamps: true
});

// Compound index to ensure unique payroll for each employee per month/year
PayrollVoucherSchema.index({ companyId: 1, empCode: 1, month: 1, year: 1 }, { unique: true });

// Index for payment voucher number uniqueness is handled by unique: true in schema

// Index for company and date queries
PayrollVoucherSchema.index({ companyId: 1, year: 1, month: 1 });
PayrollVoucherSchema.index({ companyId: 1, status: 1 });

// Pre-save middleware to validate business rules
PayrollVoucherSchema.pre('save', async function(next) {
  try {
    // Validate that net pay equals gross salary minus total deductions
    const totalDeductions = Object.values(this.deductions).reduce((sum, value) => {
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
    const calculatedNetPay = this.grossSalary - totalDeductions;
    
    if (Math.abs(this.netPay - calculatedNetPay) > 0.01) {
      throw new Error('Net pay must equal gross salary minus total deductions');
    }

    // Validate that employee exists (optional validation)
    if (this.empCode) {
      const Employee = mongoose.model('Employee');
      const employee = await Employee.findOne({ 
        empCode: this.empCode,
        company: this.companyId 
      });
      
      if (!employee) {
        throw new Error(`Employee with code ${this.empCode} not found in company ${this.companyId}`);
      }
    }

    // Set payment date when status changes to 'Paid'
    if (this.isModified('status') && this.status === 'Paid' && !this.paymentDate) {
      this.paymentDate = new Date();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get payroll by employee and period
PayrollVoucherSchema.statics.getPayrollByEmployee = async function(companyId, empCode, year, month) {
  return await this.findOne({
    companyId: companyId,
    empCode: empCode,
    year: year,
    month: month
  });
};

// Static method to get payroll by company and period
PayrollVoucherSchema.statics.getPayrollByPeriod = async function(companyId, year, month, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const query = { companyId };
  if (year) query.year = year;
  if (month) query.month = month;
  
  const total = await this.countDocuments(query);
  const payrolls = await this.find(query)
    .sort({ year: -1, month: -1, empCode: 1 })
    .skip(skip)
    .limit(limit);

  return {
    payrolls,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

// Static method to generate next payment voucher number
PayrollVoucherSchema.statics.generatePaymentVoucherNo = async function(year) {
  const yearStr = year.toString();
  const prefix = `SAL/${yearStr}/`;
  
  const lastVoucher = await this.findOne({
    paymentVoucherNo: { $regex: `^${prefix}` }
  }).sort({ paymentVoucherNo: -1 });
  
  let nextNumber = 1;
  if (lastVoucher) {
    const lastNumber = parseInt(lastVoucher.paymentVoucherNo.split('/')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
};

// Instance method to calculate total deductions
PayrollVoucherSchema.methods.getTotalDeductions = function() {
  return Object.values(this.deductions).reduce((sum, value) => {
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
};

// Instance method to get payroll summary
PayrollVoucherSchema.methods.getSummary = function() {
  return {
    empCode: this.empCode,
    period: `${this.month}/${this.year}`,
    grossSalary: this.grossSalary,
    totalDeductions: this.getTotalDeductions(),
    netPay: this.netPay,
    status: this.status,
    paymentVoucherNo: this.paymentVoucherNo
  };
};

// Transform toJSON to exclude paymentDate and approvedBy from responses
PayrollVoucherSchema.methods.toJSON = function() {
  const payrollObject = this.toObject();
  delete payrollObject.paymentDate;
  delete payrollObject.approvedBy;
  return payrollObject;
};

module.exports = mongoose.model('PayrollVoucher', PayrollVoucherSchema);
