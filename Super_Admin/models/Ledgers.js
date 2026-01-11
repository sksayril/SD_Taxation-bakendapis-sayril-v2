const mongoose = require('mongoose');

const LedgersSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: [true, 'Company ID is required'],
    trim: true
  },
  ledgerName: {
    type: String,
    required: [true, 'Ledger name is required'],
    trim: true,
    minlength: [2, 'Ledger name must be at least 2 characters'],
    maxlength: [100, 'Ledger name cannot exceed 100 characters']
  },
  underGroup: {
    type: String,
    required: [true, 'Under group is required'],
    trim: true
  },
  openingBalance: {
    type: Number,
    default: 0
  },
  ledgerType: {
    type: String,
    enum: {
      values: ['Cash', 'Bank', 'Expense', 'Income', 'Asset', 'Liability', 'Customer', 'Supplier'],
      message: 'Ledger type must be one of: Cash, Bank, Expense, Income, Asset, Liability, Customer, Supplier'
    },
    default: 'Cash'
  },
  bankDetails: {
    accountNumber: {
      type: String,
      trim: true,
      maxlength: 20
    },
    ifsc: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 11,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format']
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure ledgerName is unique per company
LedgersSchema.index({ companyId: 1, ledgerName: 1 }, { unique: true });

// Pre-save middleware to validate business rules
LedgersSchema.pre('save', async function(next) {
  try {
    // Validate that underGroup exists in Groups collection
    const Groups = mongoose.model('Groups');
    const groupExists = await Groups.findOne({
      companyId: this.companyId,
      groupName: this.underGroup
    });
    
    if (!groupExists) {
      throw new Error(`Group '${this.underGroup}' does not exist for company ${this.companyId}`);
    }

    // If ledgerType is "Bank", validate bankDetails
    if (this.ledgerType === 'Bank') {
      if (!this.bankDetails || !this.bankDetails.accountNumber || !this.bankDetails.ifsc) {
        throw new Error('Bank details (accountNumber and ifsc) are required for Bank ledger type');
      }
    } else {
      // Clear bankDetails if not Bank type
      this.bankDetails = undefined;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get ledgers by group
LedgersSchema.statics.getLedgersByGroup = async function(companyId, groupName) {
  return await this.find({
    companyId: companyId,
    underGroup: groupName
  }).sort({ ledgerName: 1 });
};

// Static method to get ledgers by type
LedgersSchema.statics.getLedgersByType = async function(companyId, ledgerType) {
  return await this.find({
    companyId: companyId,
    ledgerType: ledgerType
  }).sort({ ledgerName: 1 });
};

// Static method to search ledgers by name
LedgersSchema.statics.searchLedgers = async function(companyId, searchTerm, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const query = {
    companyId: companyId,
    ledgerName: { $regex: searchTerm, $options: 'i' }
  };

  const total = await this.countDocuments(query);
  const ledgers = await this.find(query)
    .sort({ ledgerName: 1 })
    .skip(skip)
    .limit(limit);

  return {
    ledgers,
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

// Instance method to get ledger balance (opening balance for now)
LedgersSchema.methods.getBalance = function() {
  return this.openingBalance;
};

module.exports = mongoose.model('Ledgers', LedgersSchema);
