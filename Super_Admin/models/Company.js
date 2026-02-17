const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
    { 
        company_id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },
        company_name: {
            type: String, 
            required: true,
            trim: true,
            maxlength: 100
        },
        company_email: {
            type: String, 
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        company_phone: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20
        },
        company_address: {
            street: {
                type: String,
                required: true,
                trim: true,
                maxlength: 200
            },
            city: {
                type: String,
                required: true,
                trim: true,
                maxlength: 100
            },
            state: {
                type: String,
                required: true,
                trim: true,
                maxlength: 100
            },
            country: {
                type: String,
                required: true,
                trim: true,
                maxlength: 100
            },
            zipCode: {
                type: String,
                required: true,
                trim: true,
                maxlength: 20
            }
        },
        company_logo: {
            type: String,
            trim: true,
            default: null
        },
        company_website: {
            type: String,
            trim: true,
            match: [/^https?:\/\/.+/, 'Please enter a valid website URL'],
            default: null
        },
        gstNumber: {
            type: String,
            trim: true,
            uppercase: true,
            match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/, 'Invalid GST number format (e.g., 22ABCDE1234F1Z5)'],
            unique: true,
            sparse: true // Allows multiple null values but enforces uniqueness for non-null values
        },
        fiscalYear: {
            type: String,
            trim: true,
            match: [/^[0-9]{4}-[0-9]{4}$/, 'Fiscal year must be in format YYYY-YYYY (e.g., 2024-2025)'],
            default: null
        },
        industries: {
            type: String,
            trim: true,
            maxlength: 500,
            default: null
        },
        constitution_of_business: {
            type: String,
            trim: true,
            maxlength: 500,
            default: null
        },
        tdsApplicable: {
            type: Boolean,
            default: false
        },
        tdsNumber: {
            type: String,
            trim: true,
            default: null
        },
        professional: {
            type: Boolean,
            default: false
        },
        professionalNumber: {
            type: String,
            trim: true,
            default: null
        },
        epf: {
            type: Boolean,
            default: false
        },
        epfNumber: {
            type: String,
            trim: true,
            default: null
        },
        pf: {
            type: Boolean,
            default: false
        },
        pfNumber: {
            type: String,
            trim: true,
            default: null
        },
        esic: {
            type: Boolean,
            default: false
        },
        esicNumber: {
            type: String,
            trim: true,
            default: null
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SuperAdmin',
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active'
        }
    },
    { 
        timestamps: true,
        strict: false 
    }
);

// Create sparse unique index for gstNumber to allow multiple null values
CompanySchema.index({ gstNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Company', CompanySchema);
