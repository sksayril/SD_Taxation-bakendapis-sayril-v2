const StockGroups = require('../models/StockGroups');
const Groups = require('../models/Groups');

// Create a new stock group
exports.createStockGroup = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { companyId, groupName, parentGroup, description } = req.body;

    // Check if stock group already exists for this company
    const existingStockGroup = await StockGroups.findOne({ companyId, groupName });
    if (existingStockGroup) {
      return res.status(409).json({
        success: false,
        message: `Stock group '${groupName}' already exists for company ${companyId}`
      });
    }

    // Validate that parent group exists
    const parentGroupExists = await Groups.findOne({ companyId, groupName: parentGroup });
    if (!parentGroupExists) {
      return res.status(400).json({
        success: false,
        message: `Parent group '${parentGroup}' does not exist for company ${companyId}`
      });
    }

    const stockGroup = new StockGroups({
      companyId,
      groupName,
      parentGroup,
      description
    });

    await stockGroup.save();

    res.status(201).json({
      success: true,
      message: 'Stock group created successfully',
      data: stockGroup
    });
  } catch (error) {
    console.error('Error creating stock group:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all stock groups with optional filtering, pagination and search
exports.getAllStockGroups = async (req, res) => {
  try {
    const { 
      companyId, 
      page = 1, 
      limit = 10, 
      search = '', 
      parentGroup 
    } = req.query;
    
    // Build query
    const query = {};
    if (companyId) {
      query.companyId = companyId;
    }
    if (parentGroup) {
      query.parentGroup = parentGroup;
    }
    if (search) {
      query.$or = [
        { groupName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const total = await StockGroups.countDocuments(query);

    // Get stock groups with pagination
    const stockGroups = await StockGroups.find(query)
      .sort({ groupName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      message: 'Stock groups retrieved successfully',
      data: {
        stockGroups,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching stock groups:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a single stock group by ID
exports.getStockGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const stockGroup = await StockGroups.findById(id);
    if (!stockGroup) {
      return res.status(404).json({
        success: false,
        message: 'Stock group not found'
      });
    }

    res.json({
      success: true,
      message: 'Stock group retrieved successfully',
      data: stockGroup
    });
  } catch (error) {
    console.error('Error fetching stock group:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock group ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a stock group
exports.updateStockGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if stock group exists
    const existingStockGroup = await StockGroups.findById(id);
    if (!existingStockGroup) {
      return res.status(404).json({
        success: false,
        message: 'Stock group not found'
      });
    }

    // If updating groupName, check for uniqueness within company
    if (updateData.groupName && updateData.groupName !== existingStockGroup.groupName) {
      const duplicateStockGroup = await StockGroups.findOne({
        companyId: existingStockGroup.companyId,
        groupName: updateData.groupName,
        _id: { $ne: id }
      });
      
      if (duplicateStockGroup) {
        return res.status(409).json({
          success: false,
          message: `Stock group '${updateData.groupName}' already exists for company ${existingStockGroup.companyId}`
        });
      }
    }

    // If updating parentGroup, validate it exists
    if (updateData.parentGroup && updateData.parentGroup !== existingStockGroup.parentGroup) {
      const parentGroupExists = await Groups.findOne({
        companyId: existingStockGroup.companyId,
        groupName: updateData.parentGroup
      });
      
      if (!parentGroupExists) {
        return res.status(400).json({
          success: false,
          message: `Parent group '${updateData.parentGroup}' does not exist`
        });
      }
    }

    const updatedStockGroup = await StockGroups.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Stock group updated successfully',
      data: updatedStockGroup
    });
  } catch (error) {
    console.error('Error updating stock group:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock group ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a stock group
exports.deleteStockGroup = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if stock group exists
    const stockGroup = await StockGroups.findById(id);
    if (!stockGroup) {
      return res.status(404).json({
        success: false,
        message: 'Stock group not found'
      });
    }

    // Check if there are stock items in this group
    const StockItems = require('../models/StockItems');
    const hasStockItems = await StockItems.findOne({ 
      companyId: stockGroup.companyId, 
      stockGroup: stockGroup.groupName 
    });

    if (hasStockItems) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete stock group '${stockGroup.groupName}' because it has stock items. Please delete stock items first.`
      });
    }

    await StockGroups.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Stock group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting stock group:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock group ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get stock groups by parent group
exports.getStockGroupsByParent = async (req, res) => {
  try {
    const { parentGroup } = req.params;
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const stockGroups = await StockGroups.getStockGroupsByParent(companyId, parentGroup);

    res.json({
      success: true,
      message: `Stock groups under parent group '${parentGroup}' retrieved successfully`,
      data: stockGroups
    });
  } catch (error) {
    console.error('Error fetching stock groups by parent:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search stock groups
exports.searchStockGroups = async (req, res) => {
  try {
    const { companyId, search, page = 1, limit = 10 } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    if (!search) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const result = await StockGroups.searchStockGroups(companyId, search, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      message: 'Stock groups search completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error searching stock groups:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
