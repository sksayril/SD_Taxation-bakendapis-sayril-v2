const Company = require('../models/Company');
const Counter = require('../models/Counter');
const { uploadToS3, deleteFromS3 } = require('../config/s3Config');

// Function to generate next company ID in format CI/SD/0000001
const generateCompanyId = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: 'companyId' },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true }
    );
    
    const sequenceNumber = counter.sequence.toString().padStart(7, '0');
    return `CI/SD/${sequenceNumber}`;
  } catch (error) {
    console.error('Error generating company ID:', error);
    throw new Error('Failed to generate company ID');
  }
};

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
      constitution_of_business,
      tdsApplicable,
      tdsNumber,
      professional,
      professionalNumber,
      epf,
      epfNumber,
      pf,
      pfNumber,
      esic,
      esicNumber
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

    // Parse boolean fields if they're strings (from form data)
    const parseBoolean = (value) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
      }
      return Boolean(value);
    };

    const parsedTdsApplicable = parseBoolean(tdsApplicable);
    const parsedProfessional = parseBoolean(professional);
    const parsedEpf = parseBoolean(epf);
    const parsedPf = parseBoolean(pf);
    const parsedEsic = parseBoolean(esic);

    // Generate unique company ID
    const company_id = await generateCompanyId();

    // Create new company
    // Only include gstNumber if it's provided and not empty
    const companyData = {
      company_id: company_id,
      company_name,
      company_email,
      company_phone,
      company_address: parsedCompanyAddress,
      company_logo: company_logo_url,
      company_website: company_website || null,
      fiscalYear: fiscalYear || null,
      industries: industries || null,
      constitution_of_business: constitution_of_business || null,
      tdsApplicable: parsedTdsApplicable,
      tdsNumber: parsedTdsApplicable ? (tdsNumber || null) : null,
      professional: parsedProfessional,
      professionalNumber: parsedProfessional ? (professionalNumber || null) : null,
      epf: parsedEpf,
      epfNumber: parsedEpf ? (epfNumber || null) : null,
      pf: parsedPf,
      pfNumber: parsedPf ? (pfNumber || null) : null,
      esic: parsedEsic,
      esicNumber: parsedEsic ? (esicNumber || null) : null,
      created_by: req.user.id
    };

    // Only add gstNumber if it's provided and not empty (to avoid null duplicate key error)
    if (gstNumber && gstNumber.trim() !== '') {
      companyData.gstNumber = gstNumber;
    }

    const company = await Company.create(companyData);

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: {
        _id: company._id,
        company_id: company.company_id,
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
        tdsApplicable: company.tdsApplicable,
        tdsNumber: company.tdsNumber,
        professional: company.professional,
        professionalNumber: company.professionalNumber,
        epf: company.epf,
        epfNumber: company.epfNumber,
        pf: company.pf,
        pfNumber: company.pfNumber,
        esic: company.esic,
        esicNumber: company.esicNumber,
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
    // Get query parameters for filtering
    const { status } = req.query;
    
    // Build query object
    const query = {};
    if (status) {
      // Validate status value
      const validStatuses = ['active', 'inactive', 'suspended'];
      if (validStatuses.includes(status)) {
        query.status = status;
      }
    }

    const companies = await Company.find(query)
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 });

    // Format response in compact format
    const formattedCompanies = companies.map(company => ({
      _id: company._id,
      company_id: company.company_id,
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
      tdsApplicable: company.tdsApplicable,
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

// ✅ Filter Companies by Status (POST)
exports.filterCompanies = async (req, res) => {
  try {
    // Defensive check for req.body
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is required' 
      });
    }

    const { status, company_id } = req.body;
    
    // Build query object
    const query = {};
    
    // Filter by company_id if provided
    if (company_id) {
      // Validate ObjectId format (24 hex characters)
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      if (!objectIdPattern.test(company_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company_id format. Must be a valid MongoDB ObjectId'
        });
      }
      query._id = company_id;
    }
    
    // Filter by status if provided
    if (status) {
      // Validate status value
      const validStatuses = ['active', 'inactive', 'suspended'];
      if (validStatuses.includes(status)) {
        query.status = status;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value. Must be one of: active, inactive, suspended'
        });
      }
    }

    // If both company_id and status are provided, update the company status
    if (company_id && status) {
      const company = await Company.findById(company_id);
      
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company not found'
        });
      }

      // Update company status
      company.status = status;
      await company.save();

      // Fetch updated company with populated fields
      const updatedCompany = await Company.findById(company_id)
        .populate('created_by', 'name email');

      // Format response
      const formattedCompany = {
        _id: updatedCompany._id,
        company_id: updatedCompany.company_id,
        company_name: updatedCompany.company_name,
        company_email: updatedCompany.company_email,
        company_phone: updatedCompany.company_phone,
        company_address: updatedCompany.company_address,
        company_logo: updatedCompany.company_logo,
        company_website: updatedCompany.company_website,
        gstNumber: updatedCompany.gstNumber,
        fiscalYear: updatedCompany.fiscalYear,
        industries: updatedCompany.industries,
        constitution_of_business: updatedCompany.constitution_of_business,
        tdsApplicable: updatedCompany.tdsApplicable,
        tdsNumber: updatedCompany.tdsNumber,
        professional: updatedCompany.professional,
        professionalNumber: updatedCompany.professionalNumber,
        epf: updatedCompany.epf,
        epfNumber: updatedCompany.epfNumber,
        pf: updatedCompany.pf,
        pfNumber: updatedCompany.pfNumber,
        esic: updatedCompany.esic,
        esicNumber: updatedCompany.esicNumber,
        status: updatedCompany.status,
        created_by: updatedCompany.created_by,
        createdAt: updatedCompany.createdAt,
        updatedAt: updatedCompany.updatedAt,
        __v: updatedCompany.__v
      };

      return res.json({
        success: true,
        message: `Company status updated to ${status} and filtered successfully`,
        data: [formattedCompany],
        count: 1,
        filter: {
          company_id: company_id,
          status: status
        },
        updated: true
      });
    }

    // Otherwise, just filter without updating
    const companies = await Company.find(query)
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 });

    // Format response in compact format
    const formattedCompanies = companies.map(company => ({
      _id: company._id,
      company_id: company.company_id,
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
      tdsApplicable: company.tdsApplicable,
      tdsNumber: company.tdsNumber,
      professional: company.professional,
      professionalNumber: company.professionalNumber,
      epf: company.epf,
      epfNumber: company.epfNumber,
      pf: company.pf,
      pfNumber: company.pfNumber,
      esic: company.esic,
      esicNumber: company.esicNumber,
      status: company.status,
      created_by: company.created_by,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      __v: company.__v
    }));

    // Build filter description for response
    let filterDescription = [];
    if (company_id) filterDescription.push(`company_id: ${company_id}`);
    if (status) filterDescription.push(`status: ${status}`);
    const filterText = filterDescription.length > 0 ? filterDescription.join(', ') : 'all';

    res.json({
      success: true,
      message: `Companies filtered by: ${filterText}`,
      data: formattedCompanies,
      count: formattedCompanies.length,
      filter: {
        company_id: company_id || null,
        status: status || null
      },
      updated: false
    });
  } catch (err) {
    console.error('Filter companies error:', err);
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

    // Format response to ensure company_id is included
    const formattedCompany = {
      _id: company._id,
      company_id: company.company_id,
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
      tdsApplicable: company.tdsApplicable,
      tdsNumber: company.tdsNumber,
      professional: company.professional,
      professionalNumber: company.professionalNumber,
      epf: company.epf,
      epfNumber: company.epfNumber,
      pf: company.pf,
      pfNumber: company.pfNumber,
      esic: company.esic,
      esicNumber: company.esicNumber,
      status: company.status,
      created_by: company.created_by,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };

    res.json({
      success: true,
      message: 'Company retrieved successfully',
      data: formattedCompany
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

    // Parse boolean fields if they're strings (from form data)
    const parseBoolean = (value) => {
      if (value === undefined || value === null) return undefined;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
      }
      return Boolean(value);
    };

    if (updateData.tdsApplicable !== undefined) {
      updateData.tdsApplicable = parseBoolean(updateData.tdsApplicable);
      // If tdsApplicable is false, clear tdsNumber
      if (!updateData.tdsApplicable) {
        updateData.tdsNumber = null;
      } else if (updateData.tdsNumber === undefined && !updateData.tdsApplicable) {
        updateData.tdsNumber = null;
      }
    }

    if (updateData.professional !== undefined) {
      updateData.professional = parseBoolean(updateData.professional);
      if (!updateData.professional) {
        updateData.professionalNumber = null;
      }
    }

    if (updateData.epf !== undefined) {
      updateData.epf = parseBoolean(updateData.epf);
      if (!updateData.epf) {
        updateData.epfNumber = null;
      }
    }

    if (updateData.pf !== undefined) {
      updateData.pf = parseBoolean(updateData.pf);
      if (!updateData.pf) {
        updateData.pfNumber = null;
      }
    }

    if (updateData.esic !== undefined) {
      updateData.esic = parseBoolean(updateData.esic);
      if (!updateData.esic) {
        updateData.esicNumber = null;
      }
    }

    // Update company
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('created_by', 'name email');

    // Format response to ensure company_id is included
    const formattedCompany = {
      _id: updatedCompany._id,
      company_id: updatedCompany.company_id,
      company_name: updatedCompany.company_name,
      company_email: updatedCompany.company_email,
      company_phone: updatedCompany.company_phone,
      company_address: updatedCompany.company_address,
      company_logo: updatedCompany.company_logo,
      company_website: updatedCompany.company_website,
      gstNumber: updatedCompany.gstNumber,
      fiscalYear: updatedCompany.fiscalYear,
      industries: updatedCompany.industries,
      constitution_of_business: updatedCompany.constitution_of_business,
      tdsApplicable: updatedCompany.tdsApplicable,
      tdsNumber: updatedCompany.tdsNumber,
      professional: updatedCompany.professional,
      professionalNumber: updatedCompany.professionalNumber,
      epf: updatedCompany.epf,
      epfNumber: updatedCompany.epfNumber,
      pf: updatedCompany.pf,
      pfNumber: updatedCompany.pfNumber,
      esic: updatedCompany.esic,
      esicNumber: updatedCompany.esicNumber,
      status: updatedCompany.status,
      created_by: updatedCompany.created_by,
      createdAt: updatedCompany.createdAt,
      updatedAt: updatedCompany.updatedAt
    };

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: formattedCompany
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
        _id: company._id,
        company_id: company.company_id,
        company_name: company.company_name,
        status: company.status
      }
    });
  } catch (err) {
    console.error('Update company status error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
