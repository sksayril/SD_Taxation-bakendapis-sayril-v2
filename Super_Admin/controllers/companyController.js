const Company = require('../models/Company');
const { uploadToS3, deleteFromS3 } = require('../config/s3Config');

// ✅ Create Company
exports.createCompany = async (req, res) => {
  try {
    // Defensive check for req.body
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { 
      company_name, 
      company_email, 
      company_phone, 
      company_address,
      company_website,
      gstNumber,
      fiscalYear,
      industries,
      constitution_of_business
    } = req.body;


    // Parse company_address if it's a JSON string
    let parsedCompanyAddress = company_address;
    if (typeof company_address === 'string') {
      try {
        parsedCompanyAddress = JSON.parse(company_address);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company address format. Must be a valid JSON object'
        });
      }
    }

    let company_logo_url = null;

    // Handle file upload to S3 if logo is provided
    if (req.file) {
      // Check if AWS S3 is configured
      if (!process.env.AWS_S3_BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID) {
        return res.status(400).json({
          success: false,
          message: 'AWS S3 not configured. Please set up AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in your .env file',
          error: 'Missing AWS S3 configuration'
        });
      }
      
      const uploadResult = await uploadToS3(req.file, 'company-logos');
      if (uploadResult.success) {
        company_logo_url = uploadResult.url;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Failed to upload logo to S3',
          error: uploadResult.error
        });
      }
    }

    // Check if company with same email already exists
    const existingCompany = await Company.findOne({ company_email });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company with this email already exists'
      });
    }

    // Create new company
    const company = await Company.create({
      company_name,
      company_email,
      company_phone,
      company_address: parsedCompanyAddress,
      company_logo: company_logo_url,
      company_website: company_website || null,
      gstNumber: gstNumber || null,
      fiscalYear: fiscalYear || null,
      industries: industries || null,
      constitution_of_business: constitution_of_business || null,
      created_by: req.user.id
    });


    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: {
        id: company._id,
        company_name: company.company_name,
        company_email: company.company_email,
        company_phone: company.company_phone,
        company_address: company.company_address,
        company_logo: company.company_logo,
        company_website: company.company_website,
        gstNumber: company.gstNumber,
        fiscalYear: company.fiscalYear,
        industries: company.industries,
        constitution_of_business: company.constitution_of_business,
        status: company.status,
        created_at: company.createdAt
      }
    });
  } catch (err) {
    console.error('Create company error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Get All Companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 });

    // Format response in compact format
    const formattedCompanies = companies.map(company => ({
      _id: company._id,
      company_name: company.company_name,
      company_email: company.company_email,
      company_phone: company.company_phone,
      company_address: company.company_address,
      company_logo: company.company_logo,
      company_website: company.company_website,
      gstNumber: company.gstNumber,
      fiscalYear: company.fiscalYear,
      industries: company.industries,
      constitution_of_business: company.constitution_of_business,
      status: company.status,
      created_by: company.created_by,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      __v: company.__v
    }));

    res.json({
      success: true,
      message: 'Companies retrieved successfully',
      data: formattedCompanies,
      count: formattedCompanies.length
    });
  } catch (err) {
    console.error('Get companies error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Get Company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id)
      .populate('created_by', 'name email');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      message: 'Company retrieved successfully',
      data: company
    });
  } catch (err) {
    console.error('Get company error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Update Company
exports.updateCompany = async (req, res) => {
  try {
    // Defensive check for req.body
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Handle file upload to S3 if new logo is provided
    if (req.file) {
      // Check if AWS S3 is configured
      if (!process.env.AWS_S3_BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID) {
        return res.status(400).json({
          success: false,
          message: 'AWS S3 not configured. Please set up AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in your .env file',
          error: 'Missing AWS S3 configuration'
        });
      }
      
      const uploadResult = await uploadToS3(req.file, 'company-logos');
      if (uploadResult.success) {
        updateData.company_logo = uploadResult.url;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Failed to upload logo to S3',
          error: uploadResult.error
        });
      }
    }

    // Check if company exists
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if email is being updated and if it already exists
    if (updateData.company_email && updateData.company_email !== company.company_email) {
      const existingCompany = await Company.findOne({ 
        company_email: updateData.company_email,
        _id: { $ne: id }
      });
      if (existingCompany) {
        return res.status(400).json({
          success: false,
          message: 'Company with this email already exists'
        });
      }
    }

    // Update company
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('created_by', 'name email');

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: updatedCompany
    });
  } catch (err) {
    console.error('Update company error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Delete Company
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    await Company.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (err) {
    console.error('Delete company error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Update Company Status
exports.updateCompanyStatus = async (req, res) => {
  try {
    // Defensive check for req.body
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    company.status = status;
    await company.save();

    res.json({
      success: true,
      message: 'Company status updated successfully',
      data: {
        id: company._id,
        company_name: company.company_name,
        status: company.status
      }
    });
  } catch (err) {
    console.error('Update company status error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
