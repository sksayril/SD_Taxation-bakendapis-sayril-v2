const mongoose = require('mongoose');

const StockItemsSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: [true, 'Company ID is required'],
    trim: true
  },
  stockGroup: {
    type: String,
    required: [true, 'Stock group is required'],
    trim: true
  },
  itemCode: {
    type: String,
    required: [true, 'Item code is required'],
    trim: true,
    unique: true
  },
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    minlength: [2, 'Item name must be at least 2 characters'],
    maxlength: [200, 'Item name cannot exceed 200 characters']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
    enum: {
      values: ['Nos', 'Kg', 'Ltr', 'Mtr', 'Box', 'Set', 'Pair', 'Dozen', 'Gram', 'Ton'],
      message: 'Unit must be one of: Nos, Kg, Ltr, Mtr, Box, Set, Pair, Dozen, Gram, Ton'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  rate: {
    type: Number,
    required: [true, 'Rate is required'],
    min: [0, 'Rate cannot be negative'],
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  },
  batchNo: {
    type: String,
    trim: true,
    maxlength: [50, 'Batch number cannot exceed 50 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['Available', 'Issued', 'Returned', 'Damaged', 'Lost'],
      message: 'Status must be one of: Available, Issued, Returned, Damaged, Lost'
    },
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for item code uniqueness is already defined in schema with unique: true

// Index for company and stock group queries
StockItemsSchema.index({ companyId: 1, stockGroup: 1 });
StockItemsSchema.index({ companyId: 1, status: 1 });

// Pre-save middleware to validate business rules
StockItemsSchema.pre('save', async function(next) {
  try {
    // Validate that stockGroup exists in StockGroups collection
    const StockGroups = mongoose.model('StockGroups');
    const stockGroupExists = await StockGroups.findOne({
      companyId: this.companyId,
      groupName: this.stockGroup
    });
    
    if (!stockGroupExists) {
      throw new Error(`Stock group '${this.stockGroup}' does not exist for company ${this.companyId}`);
    }

    // Calculate total value
    this.totalValue = this.quantity * this.rate;

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get stock items by group
StockItemsSchema.statics.getStockItemsByGroup = async function(companyId, stockGroup) {
  return await this.find({
    companyId: companyId,
    stockGroup: stockGroup
  }).sort({ itemName: 1 });
};

// Static method to get stock items by status
StockItemsSchema.statics.getStockItemsByStatus = async function(companyId, status) {
  return await this.find({
    companyId: companyId,
    status: status
  }).sort({ itemName: 1 });
};

// Static method to search stock items
StockItemsSchema.statics.searchStockItems = async function(companyId, searchTerm, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const query = {
    companyId: companyId,
    $or: [
      { itemCode: { $regex: searchTerm, $options: 'i' } },
      { itemName: { $regex: searchTerm, $options: 'i' } },
      { batchNo: { $regex: searchTerm, $options: 'i' } },
      { location: { $regex: searchTerm, $options: 'i' } }
    ]
  };

  const total = await this.countDocuments(query);
  const stockItems = await this.find(query)
    .sort({ itemName: 1 })
    .skip(skip)
    .limit(limit);

  return {
    stockItems,
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

// Static method to get low stock items
StockItemsSchema.statics.getLowStockItems = async function(companyId, threshold = 10) {
  return await this.find({
    companyId: companyId,
    quantity: { $lte: threshold },
    status: 'Available'
  }).sort({ quantity: 1 });
};

// Instance method to update quantity
StockItemsSchema.methods.updateQuantity = async function(newQuantity, operation = 'set') {
  if (operation === 'add') {
    this.quantity += newQuantity;
  } else if (operation === 'subtract') {
    this.quantity = Math.max(0, this.quantity - newQuantity);
  } else {
    this.quantity = newQuantity;
  }
  
  this.totalValue = this.quantity * this.rate;
  return await this.save();
};

// Instance method to get stock summary
StockItemsSchema.methods.getStockSummary = function() {
  return {
    itemCode: this.itemCode,
    itemName: this.itemName,
    quantity: this.quantity,
    rate: this.rate,
    totalValue: this.totalValue,
    status: this.status,
    location: this.location
  };
};

module.exports = mongoose.model('StockItems', StockItemsSchema);
