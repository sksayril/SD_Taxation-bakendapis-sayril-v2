const mongoose = require('mongoose');

// Schema for debit/credit entries
const EntrySchema = new mongoose.Schema({
  ledgerName: {
    type: String,
    required: [true, 'Ledger name is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  narration: {
    type: String,
    trim: true,
    maxlength: [200, 'Narration cannot exceed 200 characters']
  }
}, { _id: false });

const VouchersSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: [true, 'Company ID is required'],
    trim: true
  },
  voucherType: {
    type: String,
    required: [true, 'Voucher type is required'],
    enum: {
      values: ['Payment', 'Receipt', 'Journal', 'Sales', 'Purchase', 'Contra', 'Stock Journal'],
      message: 'Voucher type must be one of: Payment, Receipt, Journal, Sales, Purchase, Contra, Stock Journal'
    }
  },
  voucherNumber: {
    type: String,
    required: [true, 'Voucher number is required'],
    trim: true,
    unique: true
  },
  date: {
    type: Date,
    required: [true, 'Voucher date is required'],
    default: Date.now
  },
  narration: {
    type: String,
    required: [true, 'Narration is required'],
    trim: true,
    maxlength: [500, 'Narration cannot exceed 500 characters']
  },
  debitEntries: [EntrySchema],
  creditEntries: [EntrySchema],
  approvedBy: {
    type: String,
    required: [true, 'Approved by is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for voucher number uniqueness is already defined in the schema

// Index for company and date queries
VouchersSchema.index({ companyId: 1, date: -1 });
VouchersSchema.index({ companyId: 1, voucherType: 1 });

// Pre-save middleware to validate business rules
VouchersSchema.pre('save', async function(next) {
  try {
    // Validate that all ledger names exist in Ledgers collection
    const Ledgers = mongoose.model('Ledgers');
    const allLedgerNames = [
      ...this.debitEntries.map(entry => entry.ledgerName),
      ...this.creditEntries.map(entry => entry.ledgerName)
    ];

    const existingLedgers = await Ledgers.find({
      companyId: this.companyId,
      ledgerName: { $in: allLedgerNames }
    });

    if (existingLedgers.length !== allLedgerNames.length) {
      const existingLedgerNames = existingLedgers.map(ledger => ledger.ledgerName);
      const missingLedgers = allLedgerNames.filter(name => !existingLedgerNames.includes(name));
      throw new Error(`Ledgers not found: ${missingLedgers.join(', ')}`);
    }

    // Validate debit and credit totals match
    const totalDebit = this.debitEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalCredit = this.creditEntries.reduce((sum, entry) => sum + entry.amount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error('Debit and credit totals must be equal');
    }

    // Set total amount
    this.totalAmount = totalDebit;

    // Validate voucher type specific rules
    await this.validateVoucherTypeRules();

    next();
  } catch (error) {
    next(error);
  }
});

// Method to validate voucher type specific rules
VouchersSchema.methods.validateVoucherTypeRules = async function() {
  const Ledgers = mongoose.model('Ledgers');
  
  switch (this.voucherType) {
    case 'Payment':
      // Payment: Only one credit entry allowed (usually cash or bank)
      if (this.creditEntries.length !== 1) {
        throw new Error('Payment voucher must have exactly one credit entry');
      }
      break;
      
    case 'Receipt':
      // Receipt: Only one debit entry (usually cash or bank)
      if (this.debitEntries.length !== 1) {
        throw new Error('Receipt voucher must have exactly one debit entry');
      }
      break;
      
    case 'Contra':
      // Contra: Only cash and bank accounts allowed
      const contraLedgers = await Ledgers.find({
        companyId: this.companyId,
        ledgerName: { $in: [...this.debitEntries.map(e => e.ledgerName), ...this.creditEntries.map(e => e.ledgerName)] }
      });
      
      const invalidLedgers = contraLedgers.filter(ledger => 
        !['Cash', 'Bank'].includes(ledger.ledgerType)
      );
      
      if (invalidLedgers.length > 0) {
        throw new Error('Contra voucher can only use Cash or Bank ledgers');
      }
      break;
      
    case 'Sales':
      // Sales: Must have sales account in credit
      const salesCreditLedgers = this.creditEntries.map(entry => entry.ledgerName);
      const salesLedgers = await Ledgers.find({
        companyId: this.companyId,
        ledgerName: { $in: salesCreditLedgers },
        ledgerType: 'Income'
      });
      
      if (salesLedgers.length === 0) {
        throw new Error('Sales voucher must have at least one income ledger in credit');
      }
      break;
      
    case 'Purchase':
      // Purchase: Must have purchase account in debit
      const purchaseDebitLedgers = this.debitEntries.map(entry => entry.ledgerName);
      const purchaseLedgers = await Ledgers.find({
        companyId: this.companyId,
        ledgerName: { $in: purchaseDebitLedgers },
        ledgerType: 'Expense'
      });
      
      if (purchaseLedgers.length === 0) {
        throw new Error('Purchase voucher must have at least one expense ledger in debit');
      }
      break;
  }
};

// Static method to get vouchers by type
VouchersSchema.statics.getVouchersByType = async function(companyId, voucherType, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const query = { companyId, voucherType };
  const total = await this.countDocuments(query);
  
  const vouchers = await this.find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    vouchers,
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

// Static method to get vouchers by date range
VouchersSchema.statics.getVouchersByDateRange = async function(companyId, startDate, endDate, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const query = {
    companyId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  const total = await this.countDocuments(query);
  
  const vouchers = await this.find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    vouchers,
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

// Static method to search vouchers
VouchersSchema.statics.searchVouchers = async function(companyId, searchTerm, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const query = {
    companyId,
    $or: [
      { voucherNumber: { $regex: searchTerm, $options: 'i' } },
      { narration: { $regex: searchTerm, $options: 'i' } },
      { 'debitEntries.ledgerName': { $regex: searchTerm, $options: 'i' } },
      { 'creditEntries.ledgerName': { $regex: searchTerm, $options: 'i' } }
    ]
  };

  const total = await this.countDocuments(query);
  const vouchers = await this.find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    vouchers,
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

// Instance method to get voucher summary
VouchersSchema.methods.getSummary = function() {
  return {
    voucherNumber: this.voucherNumber,
    voucherType: this.voucherType,
    date: this.date,
    totalAmount: this.totalAmount,
    debitCount: this.debitEntries.length,
    creditCount: this.creditEntries.length,
    status: this.status
  };
};

module.exports = mongoose.model('Vouchers', VouchersSchema);
