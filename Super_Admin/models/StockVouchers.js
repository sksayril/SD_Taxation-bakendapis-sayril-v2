const mongoose = require('mongoose');

// Schema for stock voucher items
const StockVoucherItemSchema = new mongoose.Schema({
  itemCode: {
    type: String,
    required: [true, 'Item code is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.01, 'Quantity must be greater than 0']
  },
  rate: {
    type: Number,
    required: [true, 'Rate is required'],
    min: [0, 'Rate cannot be negative']
  }
}, { _id: false });

const StockVouchersSchema = new mongoose.Schema({
  voucherType: {
    type: String,
    required: [true, 'Voucher type is required'],
    enum: {
      values: ['Stock Journal', 'Stock Transfer', 'Stock Issue', 'Stock Return', 'Stock Adjustment'],
      message: 'Voucher type must be one of: Stock Journal, Stock Transfer, Stock Issue, Stock Return, Stock Adjustment'
    }
  },
  voucherNumber: {
    type: String,
    required: [true, 'Voucher number is required'],
    trim: true,
    unique: true
  },
  companyId: {
    type: String,
    required: [true, 'Company ID is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  narration: {
    type: String,
    required: [true, 'Narration is required'],
    trim: true,
    maxlength: [500, 'Narration cannot exceed 500 characters']
  },
  sourceLocation: {
    type: String,
    required: [true, 'Source location is required'],
    trim: true,
    maxlength: [100, 'Source location cannot exceed 100 characters']
  },
  destinationLocation: {
    type: String,
    required: [true, 'Destination location is required'],
    trim: true,
    maxlength: [100, 'Destination location cannot exceed 100 characters']
  },
  items: [StockVoucherItemSchema],
  status: {
    type: String,
    enum: {
      values: ['Issued', 'Returned', 'Pending', 'Cancelled'],
      message: 'Status must be one of: Issued, Returned, Pending, Cancelled'
    },
    default: 'Issued'
  },
  createdBy: {
    type: String,
    required: [true, 'Created by is required'],
    trim: true
  },
  totalItems: {
    type: Number,
    default: 0
  },
  totalValue: {
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

// Index for voucher number uniqueness is already defined in schema with unique: true

// Index for company and date queries
StockVouchersSchema.index({ companyId: 1, date: -1 });
StockVouchersSchema.index({ companyId: 1, voucherType: 1 });
StockVouchersSchema.index({ companyId: 1, status: 1 });

// Pre-save middleware to validate business rules
StockVouchersSchema.pre('save', async function(next) {
  try {
    // Validate that all item codes exist in StockItems collection
    const StockItems = mongoose.model('StockItems');
    const itemCodes = this.items.map(item => item.itemCode);
    
    const existingItems = await StockItems.find({
      companyId: this.companyId,
      itemCode: { $in: itemCodes }
    });

    if (existingItems.length !== itemCodes.length) {
      const existingItemCodes = existingItems.map(item => item.itemCode);
      const missingItems = itemCodes.filter(code => !existingItemCodes.includes(code));
      throw new Error(`Stock items not found: ${missingItems.join(', ')}`);
    }

    // Calculate totals
    this.totalItems = this.items.length;
    this.totalValue = this.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to update stock quantities
StockVouchersSchema.post('save', async function(doc) {
  try {
    const StockItems = mongoose.model('StockItems');
    
    for (const item of doc.items) {
      const stockItem = await StockItems.findOne({
        companyId: doc.companyId,
        itemCode: item.itemCode
      });

      if (stockItem) {
        if (doc.status === 'Issued') {
          // Reduce quantity when issued
          await stockItem.updateQuantity(item.quantity, 'subtract');
        } else if (doc.status === 'Returned') {
          // Increase quantity when returned
          await stockItem.updateQuantity(item.quantity, 'add');
        }
      }
    }
  } catch (error) {
    console.error('Error updating stock quantities:', error);
  }
});

// Static method to get stock vouchers by type
StockVouchersSchema.statics.getStockVouchersByType = async function(companyId, voucherType, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const query = { companyId, voucherType };
  const total = await this.countDocuments(query);
  
  const stockVouchers = await this.find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    stockVouchers,
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

// Static method to get stock vouchers by status
StockVouchersSchema.statics.getStockVouchersByStatus = async function(companyId, status, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const query = { companyId, status };
  const total = await this.countDocuments(query);
  
  const stockVouchers = await this.find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    stockVouchers,
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

// Static method to search stock vouchers
StockVouchersSchema.statics.searchStockVouchers = async function(companyId, searchTerm, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const query = {
    companyId,
    $or: [
      { voucherNumber: { $regex: searchTerm, $options: 'i' } },
      { narration: { $regex: searchTerm, $options: 'i' } },
      { sourceLocation: { $regex: searchTerm, $options: 'i' } },
      { destinationLocation: { $regex: searchTerm, $options: 'i' } },
      { 'items.itemCode': { $regex: searchTerm, $options: 'i' } }
    ]
  };

  const total = await this.countDocuments(query);
  const stockVouchers = await this.find(query)
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    stockVouchers,
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

// Static method to create return voucher
StockVouchersSchema.statics.createReturnVoucher = async function(originalVoucherId, returnData) {
  const originalVoucher = await this.findById(originalVoucherId);
  
  if (!originalVoucher) {
    throw new Error('Original voucher not found');
  }

  if (originalVoucher.status !== 'Issued') {
    throw new Error('Can only return issued vouchers');
  }

  // Generate new voucher number for return
  const returnVoucherNumber = `SJ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  const returnVoucher = new this({
    voucherType: 'Stock Return',
    voucherNumber: returnVoucherNumber,
    companyId: originalVoucher.companyId,
    date: new Date(),
    narration: `Return of ${originalVoucher.narration}`,
    sourceLocation: originalVoucher.destinationLocation,
    destinationLocation: originalVoucher.sourceLocation,
    items: originalVoucher.items,
    status: 'Returned',
    createdBy: returnData.createdBy
  });

  // Update original voucher status
  originalVoucher.status = 'Returned';
  await originalVoucher.save();

  return await returnVoucher.save();
};

// Instance method to get voucher summary
StockVouchersSchema.methods.getVoucherSummary = function() {
  return {
    voucherNumber: this.voucherNumber,
    voucherType: this.voucherType,
    date: this.date,
    status: this.status,
    totalItems: this.totalItems,
    totalValue: this.totalValue,
    sourceLocation: this.sourceLocation,
    destinationLocation: this.destinationLocation
  };
};

module.exports = mongoose.model('StockVouchers', StockVouchersSchema);
