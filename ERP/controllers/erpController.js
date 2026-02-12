const ERP = require('../models/ERP');

// Get all ERP records
exports.getAllERP = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { company: req.user.company };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    const erpRecords = await ERP.find(query)
      .populate('created_by', 'fullname email')
      .populate('updated_by', 'fullname email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await ERP.countDocuments(query);

    res.json({
      success: true,
      message: 'ERP records retrieved successfully',
      data: erpRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all ERP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get ERP record by ID
exports.getERPById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const erpRecord = await ERP.findOne({ _id: id, company: req.user.company })
      .populate('created_by', 'fullname email')
      .populate('updated_by', 'fullname email');

    if (!erpRecord) {
      return res.status(404).json({
        success: false,
        message: 'ERP record not found'
      });
    }

    res.json({
      success: true,
      message: 'ERP record retrieved successfully',
      data: erpRecord
    });
  } catch (error) {
    console.error('Get ERP by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create ERP record
exports.createERP = async (req, res) => {
  try {
    const { name, description, category, status, metadata } = req.body;

    const erpRecord = await ERP.create({
      name,
      description,
      category,
      status: status || 'active',
      metadata: metadata || {},
      company: req.user.company,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'ERP record created successfully',
      data: erpRecord
    });
  } catch (error) {
    console.error('Create ERP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update ERP record
exports.updateERP = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_by = req.user.id;

    const erpRecord = await ERP.findOneAndUpdate(
      { _id: id, company: req.user.company },
      updateData,
      { new: true, runValidators: true }
    )
    .populate('created_by', 'fullname email')
    .populate('updated_by', 'fullname email');

    if (!erpRecord) {
      return res.status(404).json({
        success: false,
        message: 'ERP record not found'
      });
    }

    res.json({
      success: true,
      message: 'ERP record updated successfully',
      data: erpRecord
    });
  } catch (error) {
    console.error('Update ERP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete ERP record
exports.deleteERP = async (req, res) => {
  try {
    const { id } = req.params;
    
    const erpRecord = await ERP.findOneAndDelete({ _id: id, company: req.user.company });

    if (!erpRecord) {
      return res.status(404).json({
        success: false,
        message: 'ERP record not found'
      });
    }

    res.json({
      success: true,
      message: 'ERP record deleted successfully'
    });
  } catch (error) {
    console.error('Delete ERP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
