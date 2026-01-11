const mongoose = require('mongoose');

const ComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Component name is required'],
    trim: true,
    maxlength: [100, 'Component name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Component type is required'],
    enum: {
      values: ['earning', 'deduction'],
      message: 'Component type must be either "earning" or "deduction"'
    }
  },
  kind: {
    type: String,
    required: [true, 'Component kind is required'],
    enum: {
      values: ['fixed', 'percent'],
      message: 'Component kind must be either "fixed" or "percent"'
    }
  },
  value: {
    type: Number,
    required: [true, 'Component value is required'],
    min: [0, 'Component value cannot be negative']
  }
}, { _id: false });

const SalaryStructureSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required']
  },
  name: {
    type: String,
    required: [true, 'Salary structure name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  baseForPercent: {
    type: String,
    enum: {
      values: ['CTC', 'Basic'],
      message: 'baseForPercent must be either "CTC" or "Basic"'
    },
    default: 'CTC'
  },
  components: {
    type: [ComponentSchema],
    required: [true, 'Components are required'],
    validate: {
      validator: function(components) {
        return components && components.length > 0;
      },
      message: 'At least one component is required'
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for company and name uniqueness
SalaryStructureSchema.index({ company: 1, name: 1 }, { unique: true });

// Static method to get default structure for a company
SalaryStructureSchema.statics.getDefaultForCompany = async function(companyId) {
  // First, try to find a structure with isDefault: true
  let defaultStructure = await this.findOne({ company: companyId, isDefault: true });
  
  // If not found, fallback to structure with name 'Default'
  if (!defaultStructure) {
    defaultStructure = await this.findOne({ company: companyId, name: 'Default' });
  }
  
  return defaultStructure;
};

module.exports = mongoose.model('SalaryStructure', SalaryStructureSchema);

