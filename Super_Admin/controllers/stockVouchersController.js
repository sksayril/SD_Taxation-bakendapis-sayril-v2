const StockVouchers = require('../models/StockVouchers');
const StockItems = require('../models/StockItems');

// Create a new stock voucher
exports.createStockVoucher = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { 
      voucherType, 
      voucherNumber, 
      companyId, 
      date, 
      narration, 
      sourceLocation, 
      destinationLocation, 
      items, 
      createdBy 
    } = req.body;

    // Check if voucher number already exists
    const existingVoucher = await StockVouchers.findOne({ voucherNumber });
    if (existingVoucher) {
      return res.status(409).json({
        success: false,
        message: `Voucher number '${voucherNumber}' already exists`
      });
    }

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required and must not be empty'
      });
    }

    // Validate that all item codes exist
    const itemCodes = items.map(item => item.itemCode);
    const existingItems = await StockItems.find({
      companyId,
      itemCode: { $in: itemCodes }
    });

    if (existingItems.length !== itemCodes.length) {
      const existingItemCodes = existingItems.map(item => item.itemCode);
      const missingItems = itemCodes.filter(code => !existingItemCodes.includes(code));
      return res.status(400).json({
        success: false,
        message: `Stock items not found: ${missingItems.join(', ')}`
      });
    }

    // Check if sufficient stock is available for issued items
    if (voucherType === 'Stock Issue' || voucherType === 'Stock Journal') {
      for (const item of items) {
        const stockItem = await StockItems.findOne({
          companyId,
          itemCode: item.itemCode
        });

        if (stockItem.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for item '${item.itemCode}'. Available: ${stockItem.quantity}, Required: ${item.quantity}`
          });
        }
      }
    }

    const stockVoucher = new StockVouchers({
      voucherType,
      voucherNumber,
      companyId,
      date: new Date(date),
      narration,
      sourceLocation,
      destinationLocation,
      items,
      createdBy
    });

    await stockVoucher.save();

    res.status(201).json({
      success: true,
      message: 'Stock voucher created successfully',
      data: stockVoucher
    });
  } catch (error) {
    console.error('Error creating stock voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all stock vouchers with optional filtering, pagination and search
exports.getAllStockVouchers = async (req, res) => {
  try {
    const { 
      companyId, 
      page = 1, 
      limit = 10, 
      search = '', 
      voucherType,
      status,
      startDate,
      endDate
    } = req.query;
    
    // Build query
    const query = {};
    if (companyId) {
      query.companyId = companyId;
    }
    if (voucherType) {
      query.voucherType = voucherType;
    }
    if (status) {
      query.status = status;
    }
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (search) {
      query.$or = [
        { voucherNumber: { $regex: search, $options: 'i' } },
        { narration: { $regex: search, $options: 'i' } },
        { sourceLocation: { $regex: search, $options: 'i' } },
        { destinationLocation: { $regex: search, $options: 'i' } },
        { 'items.itemCode': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const total = await StockVouchers.countDocuments(query);

    // Get stock vouchers with pagination
    const stockVouchers = await StockVouchers.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      message: 'Stock vouchers retrieved successfully',
      data: {
        stockVouchers,
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
    console.error('Error fetching stock vouchers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a single stock voucher by ID
exports.getStockVoucherById = async (req, res) => {
  try {
    const { id } = req.params;

    const stockVoucher = await StockVouchers.findById(id);
    if (!stockVoucher) {
      return res.status(404).json({
        success: false,
        message: 'Stock voucher not found'
      });
    }

    res.json({
      success: true,
      message: 'Stock voucher retrieved successfully',
      data: stockVoucher
    });
  } catch (error) {
    console.error('Error fetching stock voucher:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock voucher ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a stock voucher
exports.updateStockVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if stock voucher exists
    const existingStockVoucher = await StockVouchers.findById(id);
    if (!existingStockVoucher) {
      return res.status(404).json({
        success: false,
        message: 'Stock voucher not found'
      });
    }

    // If updating voucher number, check for uniqueness
    if (updateData.voucherNumber && updateData.voucherNumber !== existingStockVoucher.voucherNumber) {
      const duplicateVoucher = await StockVouchers.findOne({
        voucherNumber: updateData.voucherNumber,
        _id: { $ne: id }
      });
      
      if (duplicateVoucher) {
        return res.status(409).json({
          success: false,
          message: `Voucher number '${updateData.voucherNumber}' already exists`
        });
      }
    }

    // If updating items, validate item codes
    if (updateData.items) {
      const itemCodes = updateData.items.map(item => item.itemCode);
      const existingItems = await StockItems.find({
        companyId: existingStockVoucher.companyId,
        itemCode: { $in: itemCodes }
      });

      if (existingItems.length !== itemCodes.length) {
        const existingItemCodes = existingItems.map(item => item.itemCode);
        const missingItems = itemCodes.filter(code => !existingItemCodes.includes(code));
        return res.status(400).json({
          success: false,
          message: `Stock items not found: ${missingItems.join(', ')}`
        });
      }
    }

    const updatedStockVoucher = await StockVouchers.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Stock voucher updated successfully',
      data: updatedStockVoucher
    });
  } catch (error) {
    console.error('Error updating stock voucher:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock voucher ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a stock voucher
exports.deleteStockVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if stock voucher exists
    const stockVoucher = await StockVouchers.findById(id);
    if (!stockVoucher) {
      return res.status(404).json({
        success: false,
        message: 'Stock voucher not found'
      });
    }

    // If voucher is issued, reverse the stock quantities
    if (stockVoucher.status === 'Issued') {
      for (const item of stockVoucher.items) {
        const stockItem = await StockItems.findOne({
          companyId: stockVoucher.companyId,
          itemCode: item.itemCode
        });

        if (stockItem) {
          await stockItem.updateQuantity(item.quantity, 'add');
        }
      }
    }

    await StockVouchers.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Stock voucher deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting stock voucher:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock voucher ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get stock vouchers by type
exports.getStockVouchersByType = async (req, res) => {
  try {
    const { voucherType } = req.params;
    const { companyId, page = 1, limit = 10 } = req.query;

    // Validate voucherType parameter
    const validTypes = ['Stock Journal', 'Stock Transfer', 'Stock Issue', 'Stock Return', 'Stock Adjustment'];
    if (!validTypes.includes(voucherType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher type. Must be one of: Stock Journal, Stock Transfer, Stock Issue, Stock Return, Stock Adjustment'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const result = await StockVouchers.getStockVouchersByType(companyId, voucherType, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      message: `Stock vouchers with type '${voucherType}' retrieved successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error fetching stock vouchers by type:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get stock vouchers by status
exports.getStockVouchersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { companyId, page = 1, limit = 10 } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const result = await StockVouchers.getStockVouchersByStatus(companyId, status, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      message: `Stock vouchers with status '${status}' retrieved successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error fetching stock vouchers by status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search stock vouchers
exports.searchStockVouchers = async (req, res) => {
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

    const result = await StockVouchers.searchStockVouchers(companyId, search, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      message: 'Stock vouchers search completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error searching stock vouchers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create return voucher
exports.createReturnVoucher = async (req, res) => {
  try {
    const { originalVoucherId } = req.params;
    const { createdBy } = req.body;

    if (!createdBy) {
      return res.status(400).json({
        success: false,
        message: 'Created by is required'
      });
    }

    const returnVoucher = await StockVouchers.createReturnVoucher(originalVoucherId, { createdBy });

    res.json({
      success: true,
      message: 'Return voucher created successfully',
      data: returnVoucher
    });
  } catch (error) {
    console.error('Error creating return voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update stock voucher status
exports.updateStockVoucherStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Issued', 'Returned', 'Pending', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: Issued, Returned, Pending, Cancelled'
      });
    }

    const stockVoucher = await StockVouchers.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!stockVoucher) {
      return res.status(404).json({
        success: false,
        message: 'Stock voucher not found'
      });
    }

    res.json({
      success: true,
      message: `Stock voucher status updated to ${status}`,
      data: stockVoucher
    });
  } catch (error) {
    console.error('Error updating stock voucher status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
