const mongoose = require('mongoose');
const { Schema } = mongoose;

const DocumentSchema = new Schema({
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  url: String, // local path or S3 URL
  uploadedAt: { type: Date, default: Date.now }
});

const EmployeeSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  empCode: { type: String, required: true, index: true }, // unique per company ideally
  firstName: { type: String, required: true },
  lastName: String,
  email: { type: String, required: true, index: true },
  phone: String,
  dateOfBirth: Date,
  dateOfJoining: Date,
  designation: String,
  department: String,
  grade: String,
  probationEndDate: Date,
  taxCategory: { type: String, enum: ['normal','tax_exempt','special'], default: 'normal' },

  bank: {
    accountNumber: String, // consider encrypting
    ifsc: String,
    bankName: String
  },

  salaryStructure: { type: Schema.Types.ObjectId, ref: 'SalaryStructure' },
  ctcAnnual: { type: Number, default: 0 }, // rupees per year
  workLocation: String,
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },

  documents: [DocumentSchema],
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
