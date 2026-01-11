const Vouchers = require('../models/Vouchers');
const Ledgers = require('../models/Ledgers');

// Create a new voucher
exports.createVoucher = async (req, res) => {
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
      voucherType, 
      voucherNumber, 
      date, 
      narration, 
      debitEntries, 
      creditEntries, 
      approvedBy 
    } = req.body;

    // Check if voucher number already exists
    const existingVoucher = await Vouchers.findOne({ voucherNumber });
    if (existingVoucher) {
      return res.status(409).json({
        success: false,
        message: `Voucher number '${voucherNumber}' already exists`
      });
    }

    // Validate debit and credit entries
    if (!debitEntries || !Array.isArray(debitEntries) || debitEntries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debit entries are required and must be an array'
      });
    }

    if (!creditEntries || !Array.isArray(creditEntries) || creditEntries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Credit entries are required and must be an array'
      });
    }

    // Validate that all ledger names exist
    const allLedgerNames = [
      ...debitEntries.map(entry => entry.ledgerName),
      ...creditEntries.map(entry => entry.ledgerName)
    ];

    const existingLedgers = await Ledgers.find({
      companyId,
      ledgerName: { $in: allLedgerNames }
    });

    if (existingLedgers.length !== allLedgerNames.length) {
      const existingLedgerNames = existingLedgers.map(ledger => ledger.ledgerName);
      const missingLedgers = allLedgerNames.filter(name => !existingLedgerNames.includes(name));
      return res.status(400).json({
        success: false,
        message: `Ledgers not found: ${missingLedgers.join(', ')}`
      });
    }

    // Validate debit and credit totals match
    const totalDebit = debitEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalCredit = creditEntries.reduce((sum, entry) => sum + entry.amount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Debit and credit totals must be equal'
      });
    }

    const voucher = new Vouchers({
      companyId,
      voucherType,
      voucherNumber,
      date: new Date(date),
      narration,
      debitEntries,
      creditEntries,
      approvedBy,
      totalAmount: totalDebit
    });

    await voucher.save();

    res.status(201).json({
      success: true,
      message: 'Voucher created successfully',
      data: voucher
    });
  } catch (error) {
    console.error('Error creating voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all vouchers with optional filtering, pagination and search
exports.getAllVouchers = async (req, res) => {
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
        { 'debitEntries.ledgerName': { $regex: search, $options: 'i' } },
        { 'creditEntries.ledgerName': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const total = await Vouchers.countDocuments(query);

    // Get vouchers with pagination
    const vouchers = await Vouchers.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      message: 'Vouchers retrieved successfully',
      data: {
        vouchers,
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
    console.error('Error fetching vouchers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a single voucher by ID
exports.getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;

    const voucher = await Vouchers.findById(id);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    res.json({
      success: true,
      message: 'Voucher retrieved successfully',
      data: voucher
    });
  } catch (error) {
    console.error('Error fetching voucher:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a voucher
exports.updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if voucher exists
    const existingVoucher = await Vouchers.findById(id);
    if (!existingVoucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    // If updating voucher number, check for uniqueness
    if (updateData.voucherNumber && updateData.voucherNumber !== existingVoucher.voucherNumber) {
      const duplicateVoucher = await Vouchers.findOne({
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

    // If updating entries, validate ledger names and totals
    if (updateData.debitEntries || updateData.creditEntries) {
      const debitEntries = updateData.debitEntries || existingVoucher.debitEntries;
      const creditEntries = updateData.creditEntries || existingVoucher.creditEntries;

      // Validate ledger names exist
      const allLedgerNames = [
        ...debitEntries.map(entry => entry.ledgerName),
        ...creditEntries.map(entry => entry.ledgerName)
      ];

      const existingLedgers = await Ledgers.find({
        companyId: existingVoucher.companyId,
        ledgerName: { $in: allLedgerNames }
      });

      if (existingLedgers.length !== allLedgerNames.length) {
        const existingLedgerNames = existingLedgers.map(ledger => ledger.ledgerName);
        const missingLedgers = allLedgerNames.filter(name => !existingLedgerNames.includes(name));
        return res.status(400).json({
          success: false,
          message: `Ledgers not found: ${missingLedgers.join(', ')}`
        });
      }

      // Validate debit and credit totals match
      const totalDebit = debitEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const totalCredit = creditEntries.reduce((sum, entry) => sum + entry.amount, 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return res.status(400).json({
          success: false,
          message: 'Debit and credit totals must be equal'
        });
      }

      updateData.totalAmount = totalDebit;
    }

    const updatedVoucher = await Vouchers.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Voucher updated successfully',
      data: updatedVoucher
    });
  } catch (error) {
    console.error('Error updating voucher:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if voucher exists
    const voucher = await Vouchers.findById(id);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    await Vouchers.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Voucher deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get vouchers by type
exports.getVouchersByType = async (req, res) => {
  try {
    const { voucherType } = req.params;
    const { companyId, page = 1, limit = 10 } = req.query;

    // Validate voucherType parameter
    const validTypes = ['Payment', 'Receipt', 'Journal', 'Sales', 'Purchase', 'Contra', 'Stock Journal'];
    if (!validTypes.includes(voucherType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher type. Must be one of: Payment, Receipt, Journal, Sales, Purchase, Contra, Stock Journal'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const result = await Vouchers.getVouchersByType(companyId, voucherType, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      message: `Vouchers with type '${voucherType}' retrieved successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error fetching vouchers by type:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get vouchers by date range
exports.getVouchersByDateRange = async (req, res) => {
  try {
    const { companyId, startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const result = await Vouchers.getVouchersByDateRange(companyId, startDate, endDate, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      message: `Vouchers from ${startDate} to ${endDate} retrieved successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error fetching vouchers by date range:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search vouchers
exports.searchVouchers = async (req, res) => {
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

    const result = await Vouchers.searchVouchers(companyId, search, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      message: 'Vouchers search completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error searching vouchers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Approve/Reject voucher
exports.updateVoucherStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Rejected'
      });
    }

    const voucher = await Vouchers.findByIdAndUpdate(
      id,
      { 
        status, 
        approvedBy: status === 'Approved' ? approvedBy : undefined 
      },
      { new: true }
    );

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    res.json({
      success: true,
      message: `Voucher ${status.toLowerCase()} successfully`,
      data: voucher
    });
  } catch (error) {
    console.error('Error updating voucher status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
