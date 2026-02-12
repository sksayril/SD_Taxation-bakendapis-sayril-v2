const CRM = require('../models/CRM');

// Get all CRM records
exports.getAllCRM = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { company: req.user.company };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const crmRecords = await CRM.find(query)
      .populate('created_by', 'fullname email')
      .populate('updated_by', 'fullname email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await CRM.countDocuments(query);

    res.json({
      success: true,
      message: 'CRM records retrieved successfully',
      data: crmRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all CRM error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get CRM record by ID
exports.getCRMById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const crmRecord = await CRM.findOne({ _id: id, company: req.user.company })
      .populate('created_by', 'fullname email')
      .populate('updated_by', 'fullname email');

    if (!crmRecord) {
      return res.status(404).json({
        success: false,
        message: 'CRM record not found'
      });
    }

    res.json({
      success: true,
      message: 'CRM record retrieved successfully',
      data: crmRecord
    });
  } catch (error) {
    console.error('Get CRM by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create CRM record
exports.createCRM = async (req, res) => {
  try {
    const { name, email, phone, notes, status } = req.body;

    const crmRecord = await CRM.create({
      name,
      email,
      phone,
      notes,
      status: status || 'active',
      company: req.user.company,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'CRM record created successfully',
      data: crmRecord
    });
  } catch (error) {
    console.error('Create CRM error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update CRM record
exports.updateCRM = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_by = req.user.id;

    const crmRecord = await CRM.findOneAndUpdate(
      { _id: id, company: req.user.company },
      updateData,
      { new: true, runValidators: true }
    )
    .populate('created_by', 'fullname email')
    .populate('updated_by', 'fullname email');

    if (!crmRecord) {
      return res.status(404).json({
        success: false,
        message: 'CRM record not found'
      });
    }

    res.json({
      success: true,
      message: 'CRM record updated successfully',
      data: crmRecord
    });
  } catch (error) {
    console.error('Update CRM error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete CRM record
exports.deleteCRM = async (req, res) => {
  try {
    const { id } = req.params;
    
    const crmRecord = await CRM.findOneAndDelete({ _id: id, company: req.user.company });

    if (!crmRecord) {
      return res.status(404).json({
        success: false,
        message: 'CRM record not found'
      });
    }

    res.json({
      success: true,
      message: 'CRM record deleted successfully'
    });
  } catch (error) {
    console.error('Delete CRM error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
