const mongoose = require('mongoose');

const PeriodSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2000, 'Year must be a valid year'],
    max: [2100, 'Year must be a valid year']
  }
}, { _id: false });

const EarningDeductionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  }
}, { _id: false });

const PayslipSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required']
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee is required']
  },
  period: {
    type: PeriodSchema,
    required: [true, 'Period is required']
  },
  earnings: {
    type: [EarningDeductionSchema],
    default: []
  },
  deductions: {
    type: [EarningDeductionSchema],
    default: []
  },
  gross: {
    type: Number,
    required: [true, 'Gross salary is required'],
    min: [0, 'Gross salary cannot be negative']
  },
  totalDeductions: {
    type: Number,
    required: [true, 'Total deductions is required'],
    min: [0, 'Total deductions cannot be negative'],
    default: 0
  },
  netPay: {
    type: Number,
    required: [true, 'Net pay is required'],
    min: [0, 'Net pay cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'approved', 'paid'],
      message: 'Status must be one of: draft, approved, paid'
    },
    default: 'draft'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  paymentRef: {
    type: String,
    trim: true,
    maxlength: [200, 'Payment reference cannot exceed 200 characters'],
    default: null
  },
  pdfUrl: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true
});

// Compound unique index: one payslip per employee per period per company
PayslipSchema.index({ company: 1, employee: 1, 'period.month': 1, 'period.year': 1 }, { unique: true });

// Indexes for common queries
PayslipSchema.index({ company: 1, 'period.year': 1, 'period.month': 1 });
PayslipSchema.index({ company: 1, status: 1 });
PayslipSchema.index({ employee: 1, 'period.year': 1, 'period.month': 1 });

// Static method to find payslip by employee and period
// Returns a query object that can be chained with populate() or executed with await
PayslipSchema.statics.findByEmployeeAndPeriod = function(companyId, employeeId, month, year) {
  return this.findOne({
    company: companyId,
    employee: employeeId,
    'period.month': month,
    'period.year': year
  });
};

// Instance method to get summary
PayslipSchema.methods.getSummary = function() {
  return {
    _id: this._id,
    employee: this.employee,
    period: `${this.period.month}/${this.period.year}`,
    gross: this.gross,
    totalDeductions: this.totalDeductions,
    netPay: this.netPay,
    status: this.status
  };
};

module.exports = mongoose.model('Payslip', PayslipSchema);

