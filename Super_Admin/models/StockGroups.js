const mongoose = require('mongoose');

const StockGroupsSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: [true, 'Company ID is required'],
    trim: true
  },
  groupName: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    minlength: [2, 'Group name must be at least 2 characters'],
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  parentGroup: {
    type: String,
    required: [true, 'Parent group is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure groupName is unique per company
StockGroupsSchema.index({ companyId: 1, groupName: 1 }, { unique: true });

// Pre-save middleware to validate business rules
StockGroupsSchema.pre('save', async function(next) {
  try {
    // Validate that parentGroup exists in Groups collection
    const Groups = mongoose.model('Groups');
    const parentGroupExists = await Groups.findOne({
      companyId: this.companyId,
      groupName: this.parentGroup
    });
    
    if (!parentGroupExists) {
      throw new Error(`Parent group '${this.parentGroup}' does not exist for company ${this.companyId}`);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get stock groups by parent group
StockGroupsSchema.statics.getStockGroupsByParent = async function(companyId, parentGroup) {
  return await this.find({
    companyId: companyId,
    parentGroup: parentGroup
  }).sort({ groupName: 1 });
};

// Static method to search stock groups
StockGroupsSchema.statics.searchStockGroups = async function(companyId, searchTerm, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const query = {
    companyId: companyId,
    $or: [
      { groupName: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  };

  const total = await this.countDocuments(query);
  const stockGroups = await this.find(query)
    .sort({ groupName: 1 })
    .skip(skip)
    .limit(limit);

  return {
    stockGroups,
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

// Instance method to get stock items in this group
StockGroupsSchema.methods.getStockItems = async function() {
  const StockItems = mongoose.model('StockItems');
  return await StockItems.find({
    companyId: this.companyId,
    stockGroup: this.groupName
  }).sort({ itemName: 1 });
};

module.exports = mongoose.model('StockGroups', StockGroupsSchema);
