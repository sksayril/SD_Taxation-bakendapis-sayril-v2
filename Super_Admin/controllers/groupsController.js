const Groups = require('../models/Groups');

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    // Defensive check for req.body
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { companyId, groupName, underGroupId, nature, isPrimary } = req.body;

    // Check if group already exists for this company
    const existingGroup = await Groups.findOne({ companyId, groupName });
    if (existingGroup) {
      return res.status(409).json({
        success: false,
        message: `Group '${groupName}' already exists for company ${companyId}`
      });
    }

    // If underGroupId is provided, validate it exists
    if (underGroupId && !isPrimary) {
      const parentGroup = await Groups.findById(underGroupId);
      if (!parentGroup) {
        return res.status(400).json({
          success: false,
          message: `Parent group with ID '${underGroupId}' does not exist`
        });
      }

      // Ensure parent group belongs to the same company
      if (parentGroup.companyId !== companyId) {
        return res.status(400).json({
          success: false,
          message: 'Parent group must belong to the same company'
        });
      }
    }

    const group = new Groups({
      companyId,
      groupName,
      underGroupId: underGroupId || null,
      nature,
      isPrimary
    });

    await group.save();

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: group
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all groups with optional filtering, pagination and search
exports.getAllGroups = async (req, res) => {
  try {
    const { 
      companyId, 
      page = 1, 
      limit = 10, 
      search = '', 
      nature,
      isPrimary 
    } = req.query;
    
    // Build query
    const query = {};
    if (companyId) {
      query.companyId = companyId;
    }
    if (search) {
      query.groupName = { $regex: search, $options: 'i' };
    }
    if (nature) {
      query.nature = nature;
    }
    if (isPrimary !== undefined) {
      query.isPrimary = isPrimary === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const total = await Groups.countDocuments(query);

    // Get groups with pagination
    const groups = await Groups.find(query)
      .sort({ groupName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      message: 'Groups retrieved successfully',
      data: {
        groups,
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
    console.error('Error fetching groups:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a single group by ID
exports.getGroupById = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Groups.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.json({
      success: true,
      message: 'Group retrieved successfully',
      data: group
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a group
exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if group exists
    const existingGroup = await Groups.findById(id);
    if (!existingGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // If updating groupName, check for uniqueness within company
    if (updateData.groupName && updateData.groupName !== existingGroup.groupName) {
      const duplicateGroup = await Groups.findOne({
        companyId: existingGroup.companyId,
        groupName: updateData.groupName,
        _id: { $ne: id }
      });
      
      if (duplicateGroup) {
        return res.status(409).json({
          success: false,
          message: `Group '${updateData.groupName}' already exists for company ${existingGroup.companyId}`
        });
      }
    }

    // If updating underGroupId, validate it exists
    if (updateData.underGroupId) {
      const parentGroup = await Groups.findById(updateData.underGroupId);
      
      if (!parentGroup) {
        return res.status(400).json({
          success: false,
          message: `Parent group with ID '${updateData.underGroupId}' does not exist`
        });
      }

      // Ensure parent group belongs to the same company
      if (parentGroup.companyId !== existingGroup.companyId) {
        return res.status(400).json({
          success: false,
          message: 'Parent group must belong to the same company'
        });
      }
    }

    const updatedGroup = await Groups.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: updatedGroup
    });
  } catch (error) {
    console.error('Error updating group:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a group
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if group exists
    const group = await Groups.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if group has subgroups
    const subgroups = await Groups.find({
      underGroupId: group._id
    });

    if (subgroups.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete group '${group.groupName}' because it has ${subgroups.length} subgroup(s). Please delete subgroups first.`,
        data: {
          subgroups: subgroups.map(sub => ({
            id: sub._id,
            groupName: sub.groupName
          }))
        }
      });
    }

    await Groups.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all subgroups under a specific group
exports.getSubGroups = async (req, res) => {
  try {
    const { id } = req.params;

    const parentGroup = await Groups.findById(id);
    if (!parentGroup) {
      return res.status(404).json({
        success: false,
        message: 'Parent group not found'
      });
    }

    const subgroups = await Groups.getSubGroups(parentGroup._id);

    res.json({
      success: true,
      message: `Subgroups of '${parentGroup.groupName}' retrieved successfully`,
      data: {
        parentGroup: {
          id: parentGroup._id,
          groupName: parentGroup.groupName,
          companyId: parentGroup.companyId
        },
        subgroups
      }
    });
  } catch (error) {
    console.error('Error fetching subgroups:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get groups by nature
exports.getGroupsByNature = async (req, res) => {
  try {
    const { nature } = req.params;
    const { companyId } = req.query;

    // Validate nature parameter
    const validNatures = ['Assets', 'Liabilities', 'Income', 'Expenses'];
    if (!validNatures.includes(nature)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid nature. Must be one of: Assets, Liabilities, Income, Expenses'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const groups = await Groups.getGroupsByNature(companyId, nature);

    res.json({
      success: true,
      message: `Groups with nature '${nature}' retrieved successfully`,
      data: groups
    });
  } catch (error) {
    console.error('Error fetching groups by nature:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Search groups by name
exports.searchGroups = async (req, res) => {
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

    const result = await Groups.searchGroups(companyId, search, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      message: 'Groups search completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error searching groups:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
