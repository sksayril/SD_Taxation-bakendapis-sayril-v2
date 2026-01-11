const Ledgers = require('../models/Ledgers');
const Groups = require('../models/Groups');

// Create a new ledger
exports.createLedger = async (req, res) => {
  try {
    // Defensive check for req.body
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { 
      companyId, 
      ledgerName, 
      underGroup, 
      openingBalance = 0, 
      ledgerType = 'Cash',
      bankDetails 
    } = req.body;

    // Check if ledger already exists for this company
    const existingLedger = await Ledgers.findOne({ companyId, ledgerName });
    if (existingLedger) {
      return res.status(409).json({
        success: false,
        message: `Ledger '${ledgerName}' already exists for company ${companyId}`
      });
    }

    // Validate that underGroup exists
    const groupExists = await Groups.findOne({ companyId, groupName: underGroup });
    if (!groupExists) {
      return res.status(400).json({
        success: false,
        message: `Group '${underGroup}' does not exist for company ${companyId}`
      });
    }

    // Validate bank details for Bank type
    if (ledgerType === 'Bank') {
      if (!bankDetails || !bankDetails.accountNumber || !bankDetails.ifsc) {
        return res.status(400).json({
          success: false,
          message: 'Bank details (accountNumber and ifsc) are required for Bank ledger type'
        });
      }
    }

    const ledger = new Ledgers({
      companyId,
      ledgerName,
      underGroup,
      openingBalance,
      ledgerType,
      bankDetails: ledgerType === 'Bank' ? bankDetails : undefined
    });

    await ledger.save();

    res.status(201).json({
      success: true,
      message: 'Ledger created successfully',
      data: ledger
    });
  } catch (error) {
    console.error('Error creating ledger:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all ledgers with optional filtering, pagination and search
exports.getAllLedgers = async (req, res) => {
  try {
    const { 
      companyId, 
      page = 1, 
      limit = 10, 
      search = '', 
      underGroup,
      ledgerType 
    } = req.query;
    
    // Build query
    const query = {};
    if (companyId) {
      query.companyId = companyId;
    }
    if (search) {
      query.ledgerName = { $regex: search, $options: 'i' };
    }
    if (underGroup) {
      query.underGroup = underGroup;
    }
    if (ledgerType) {
      query.ledgerType = ledgerType;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const total = await Ledgers.countDocuments(query);

    // Get ledgers with pagination
    const ledgers = await Ledgers.find(query)
      .sort({ ledgerName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      message: 'Ledgers retrieved successfully',
      data: {
        ledgers,
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
    console.error('Error fetching ledgers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a single ledger by ID
exports.getLedgerById = async (req, res) => {
  try {
    const { id } = req.params;

    const ledger = await Ledgers.findById(id);
    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: 'Ledger not found'
      });
    }

    res.json({
      success: true,
      message: 'Ledger retrieved successfully',
      data: ledger
    });
  } catch (error) {
    console.error('Error fetching ledger:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ledger ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a ledger
exports.updateLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if ledger exists
    const existingLedger = await Ledgers.findById(id);
    if (!existingLedger) {
      return res.status(404).json({
        success: false,
        message: 'Ledger not found'
      });
    }

    // If updating ledgerName, check for uniqueness within company
    if (updateData.ledgerName && updateData.ledgerName !== existingLedger.ledgerName) {
      const duplicateLedger = await Ledgers.findOne({
        companyId: existingLedger.companyId,
        ledgerName: updateData.ledgerName,
        _id: { $ne: id }
      });
      
      if (duplicateLedger) {
        return res.status(409).json({
          success: false,
          message: `Ledger '${updateData.ledgerName}' already exists for company ${existingLedger.companyId}`
        });
      }
    }

    // If updating underGroup, validate it exists
    if (updateData.underGroup && updateData.underGroup !== existingLedger.underGroup) {
      const groupExists = await Groups.findOne({
        companyId: existingLedger.companyId,
        groupName: updateData.underGroup
      });
      
      if (!groupExists) {
        return res.status(400).json({
          success: false,
          message: `Group '${updateData.underGroup}' does not exist`
        });
      }
    }

    // Validate bank details for Bank type
    if (updateData.ledgerType === 'Bank') {
      if (!updateData.bankDetails || !updateData.bankDetails.accountNumber || !updateData.bankDetails.ifsc) {
        return res.status(400).json({
          success: false,
          message: 'Bank details (accountNumber and ifsc) are required for Bank ledger type'
        });
      }
    } else if (updateData.ledgerType && updateData.ledgerType !== 'Bank') {
      // Clear bankDetails if not Bank type
      updateData.bankDetails = undefined;
    }

    const updatedLedger = await Ledgers.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Ledger updated successfully',
      data: updatedLedger
    });
  } catch (error) {
    console.error('Error updating ledger:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ledger ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a ledger
exports.deleteLedger = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ledger exists
    const ledger = await Ledgers.findById(id);
    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: 'Ledger not found'
      });
    }

    await Ledgers.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Ledger deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ledger:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ledger ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get ledgers by group
exports.getLedgersByGroup = async (req, res) => {
  try {
    const { groupName } = req.params;
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const ledgers = await Ledgers.getLedgersByGroup(companyId, groupName);

    res.json({
      success: true,
      message: `Ledgers under group '${groupName}' retrieved successfully`,
      data: ledgers
    });
  } catch (error) {
    console.error('Error fetching ledgers by group:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get ledgers by type
exports.getLedgersByType = async (req, res) => {
  try {
    const { ledgerType } = req.params;
    const { companyId } = req.query;

    // Validate ledgerType parameter
    const validTypes = ['Cash', 'Bank', 'Expense', 'Income', 'Asset', 'Liability', 'Customer', 'Supplier'];
    if (!validTypes.includes(ledgerType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ledger type. Must be one of: Cash, Bank, Expense, Income, Asset, Liability, Customer, Supplier'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const ledgers = await Ledgers.getLedgersByType(companyId, ledgerType);

    res.json({
      success: true,
      message: `Ledgers with type '${ledgerType}' retrieved successfully`,
      data: ledgers
    });
  } catch (error) {
    console.error('Error fetching ledgers by type:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search ledgers by name
exports.searchLedgers = async (req, res) => {
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

    const result = await Ledgers.searchLedgers(companyId, search, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      message: 'Ledgers search completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error searching ledgers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
