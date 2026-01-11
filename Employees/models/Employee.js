const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
    { 
        fullname: {
            type: String, 
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        email: {
            type: String, 
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        password: {
            type: String,
            minlength: 6
        },
        role: {
            type: String,
            enum: ['Employee', 'HR', 'OR', 'Developer'],
            default: 'Employee'
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 20
        },
        department: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        designation: {
            type: String,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        empCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 20,
            match: [/^[A-Z0-9]+$/, 'Employee code can only contain uppercase letters and numbers']
        },
        salary: {
            type: Number,
            required: true,
            min: 0,
            max: 99999999
        },
        bankDetails: {
            bankName: {
                type: String,
                trim: true,
                maxlength: 100
            },
            accountNumber: {
                type: String,
                trim: true,
                maxlength: 20,
                match: [/^[0-9]+$/, 'Account number can only contain digits']
            },
            ifsc: {
                type: String,
                trim: true,
                uppercase: true,
                maxlength: 11,
                match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format']
            },
            branch: {
                type: String,
                trim: true,
                maxlength: 100
            }
        },
        aadharId: {
            type: String,
            unique: true,
            trim: true,
            match: [/^[0-9]{12}$/, 'Aadhar ID must be exactly 12 digits'],
            sparse: true
        },
        panNo: {
            type: String,
            unique: true,
            trim: true,
            uppercase: true,
            match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format'],
            sparse: true
        },
        joinDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        address: {
            street: {
                type: String,
                trim: true,
                maxlength: 200
            },
            city: {
                type: String,
                trim: true,
                maxlength: 100
            },
            state: {
                type: String,
                trim: true,
                maxlength: 100
            },
            country: {
                type: String,
                trim: true,
                maxlength: 100
            },
            zipCode: {
                type: String,
                trim: true,
                maxlength: 20
            }
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true
        },
        lastLogin: {
            type: Date,
            default: null
        }
    },
    { timestamps: true, strict: false }
);

// Instance method to compare password (plain text comparison)
EmployeeSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return candidatePassword === this.password; // Plain text comparison
};

// Static method to find by email
EmployeeSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Pre-save hook to remove username field if it exists (Employee model doesn't use username)
EmployeeSchema.pre('save', function(next) {
    // Remove username field if it exists (shouldn't be in Employee model)
    if (this.isNew || this.isModified()) {
        if (this.username !== undefined) {
            delete this.username;
        }
    }
    next();
});

// Transform toJSON to ensure password is never returned (except for Admin/SuperAdmin)
EmployeeSchema.methods.toJSON = function(options = {}) {
    const employeeObject = this.toObject();
    
    // Only exclude password if not explicitly requested by Admin/SuperAdmin
    if (!options.includePassword) {
        delete employeeObject.password;
    }
    
    return employeeObject;
};

module.exports = mongoose.model('Employee', EmployeeSchema);
