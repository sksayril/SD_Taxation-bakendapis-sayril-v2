const mongoose = require('mongoose');

const GroupsSchema = new mongoose.Schema({
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
  underGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Groups',
    default: null
  },
  nature: {
    type: String,
    required: [true, 'Nature is required'],
    enum: {
      values: ['Assets', 'Liabilities', 'Income', 'Expenses'],
      message: 'Nature must be one of: Assets, Liabilities, Income, Expenses'
    }
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure groupName is unique per company
GroupsSchema.index({ companyId: 1, groupName: 1 }, { unique: true });

// Pre-save middleware to validate business rules
GroupsSchema.pre('save', async function(next) {
  try {
    // If underGroupId is provided, validate it exists
    if (this.underGroupId) {
      const parentGroup = await this.constructor.findById(this.underGroupId);
      
      if (!parentGroup) {
        throw new Error(`Parent group with ID '${this.underGroupId}' does not exist`);
      }

      // Ensure parent group belongs to the same company
      if (parentGroup.companyId !== this.companyId) {
        throw new Error('Parent group must belong to the same company');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get all subgroups under a specific group
GroupsSchema.statics.getSubGroups = async function(parentGroupId) {
  return await this.find({
    underGroupId: parentGroupId
  });
};

// Instance method to get all subgroups of this group
GroupsSchema.methods.getSubGroups = async function() {
  return await this.constructor.find({
    underGroupId: this._id
  });
};

// Static method to get groups by nature
GroupsSchema.statics.getGroupsByNature = async function(companyId, nature) {
  return await this.find({
    companyId: companyId,
    nature: nature
  }).sort({ groupName: 1 });
};

// Static method to search groups by name
GroupsSchema.statics.searchGroups = async function(companyId, searchTerm, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const query = {
    companyId: companyId,
    groupName: { $regex: searchTerm, $options: 'i' }
  };

  const total = await this.countDocuments(query);
  const groups = await this.find(query)
    .sort({ groupName: 1 })
    .skip(skip)
    .limit(limit);

  return {
    groups,
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

module.exports = mongoose.model('Groups', GroupsSchema);