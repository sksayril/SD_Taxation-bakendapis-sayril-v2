const StockItems = require('../models/StockItems');
const StockGroups = require('../models/StockGroups');

// Create a new stock item
exports.createStockItem = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { 
      companyId, 
      stockGroup, 
      itemCode, 
      itemName, 
      unit, 
      quantity, 
      rate, 
      batchNo, 
      location, 
      status = 'Available' 
    } = req.body;

    // Check if item code already exists
    const existingItem = await StockItems.findOne({ itemCode });
    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: `Item code '${itemCode}' already exists`
      });
    }

    // Validate that stock group exists
    const stockGroupExists = await StockGroups.findOne({ companyId, groupName: stockGroup });
    if (!stockGroupExists) {
      return res.status(400).json({
        success: false,
        message: `Stock group '${stockGroup}' does not exist for company ${companyId}`
      });
    }

    const stockItem = new StockItems({
      companyId,
      stockGroup,
      itemCode,
      itemName,
      unit,
      quantity,
      rate,
      batchNo,
      location,
      status
    });

    await stockItem.save();

    res.status(201).json({
      success: true,
      message: 'Stock item created successfully',
      data: stockItem
    });
  } catch (error) {
    console.error('Error creating stock item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all stock items with optional filtering, pagination and search
exports.getAllStockItems = async (req, res) => {
  try {
    const { 
      companyId, 
      page = 1, 
      limit = 10, 
      search = '', 
      stockGroup,
      status,
      location
    } = req.query;
    
    // Build query
    const query = {};
    if (companyId) {
      query.companyId = companyId;
    }
    if (stockGroup) {
      query.stockGroup = stockGroup;
    }
    if (status) {
      query.status = status;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { itemCode: { $regex: search, $options: 'i' } },
        { itemName: { $regex: search, $options: 'i' } },
        { batchNo: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const total = await StockItems.countDocuments(query);

    // Get stock items with pagination
    const stockItems = await StockItems.find(query)
      .sort({ itemName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      message: 'Stock items retrieved successfully',
      data: {
        stockItems,
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
    console.error('Error fetching stock items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a single stock item by ID
exports.getStockItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const stockItem = await StockItems.findById(id);
    if (!stockItem) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    res.json({
      success: true,
      message: 'Stock item retrieved successfully',
      data: stockItem
    });
  } catch (error) {
    console.error('Error fetching stock item:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock item ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a stock item
exports.updateStockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if stock item exists
    const existingStockItem = await StockItems.findById(id);
    if (!existingStockItem) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    // If updating itemCode, check for uniqueness
    if (updateData.itemCode && updateData.itemCode !== existingStockItem.itemCode) {
      const duplicateItem = await StockItems.findOne({
        itemCode: updateData.itemCode,
        _id: { $ne: id }
      });
      
      if (duplicateItem) {
        return res.status(409).json({
          success: false,
          message: `Item code '${updateData.itemCode}' already exists`
        });
      }
    }

    // If updating stockGroup, validate it exists
    if (updateData.stockGroup && updateData.stockGroup !== existingStockItem.stockGroup) {
      const stockGroupExists = await StockGroups.findOne({
        companyId: existingStockItem.companyId,
        groupName: updateData.stockGroup
      });
      
      if (!stockGroupExists) {
        return res.status(400).json({
          success: false,
          message: `Stock group '${updateData.stockGroup}' does not exist`
        });
      }
    }

    const updatedStockItem = await StockItems.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Stock item updated successfully',
      data: updatedStockItem
    });
  } catch (error) {
    console.error('Error updating stock item:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock item ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a stock item
exports.deleteStockItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if stock item exists
    const stockItem = await StockItems.findById(id);
    if (!stockItem) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    // Check if item has quantity (cannot delete if has stock)
    if (stockItem.quantity > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete stock item '${stockItem.itemName}' because it has ${stockItem.quantity} units in stock. Please adjust quantity to zero first.`
      });
    }

    await StockItems.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Stock item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting stock item:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock item ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get stock items by group
exports.getStockItemsByGroup = async (req, res) => {
  try {
    const { stockGroup } = req.params;
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const stockItems = await StockItems.getStockItemsByGroup(companyId, stockGroup);

    res.json({
      success: true,
      message: `Stock items in group '${stockGroup}' retrieved successfully`,
      data: stockItems
    });
  } catch (error) {
    console.error('Error fetching stock items by group:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get stock items by status
exports.getStockItemsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const stockItems = await StockItems.getStockItemsByStatus(companyId, status);

    res.json({
      success: true,
      message: `Stock items with status '${status}' retrieved successfully`,
      data: stockItems
    });
  } catch (error) {
    console.error('Error fetching stock items by status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get low stock items
exports.getLowStockItems = async (req, res) => {
  try {
    const { companyId, threshold = 10 } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const lowStockItems = await StockItems.getLowStockItems(companyId, parseInt(threshold));

    res.json({
      success: true,
      message: `Low stock items (threshold: ${threshold}) retrieved successfully`,
      data: lowStockItems
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search stock items
exports.searchStockItems = async (req, res) => {
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

    const result = await StockItems.searchStockItems(companyId, search, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      message: 'Stock items search completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error searching stock items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update stock item quantity
exports.updateStockQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'set' } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }

    const stockItem = await StockItems.findById(id);
    if (!stockItem) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found'
      });
    }

    const updatedStockItem = await stockItem.updateQuantity(parseInt(quantity), operation);

    res.json({
      success: true,
      message: `Stock quantity ${operation === 'add' ? 'added' : operation === 'subtract' ? 'subtracted' : 'updated'} successfully`,
      data: updatedStockItem
    });
  } catch (error) {
    console.error('Error updating stock quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
