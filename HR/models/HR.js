const mongoose = require('mongoose');

const HRSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3,
            maxlength: 50,
            match: [/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers']
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
            enum: ['HR', 'Finance', 'Accountant'],
            required: true,
            default: 'HR'
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 20
        },
        designation: {
            type: String,
            trim: true,
            minlength: 2,
            maxlength: 100
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
HRSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return candidatePassword === this.password; // Plain text comparison
};

// Static methods for finding by email and username
HRSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

HRSchema.statics.findByUsername = function(username) {
    return this.findOne({ username: username.toLowerCase() });
};

// Transform toJSON to ensure password is never returned (except for Admin/SuperAdmin)
HRSchema.methods.toJSON = function(options = {}) {
    const hrObject = this.toObject();
    
    // Only exclude password if not explicitly requested by Admin/SuperAdmin
    if (!options.includePassword) {
        delete hrObject.password;
    }
    
    return hrObject;
};

module.exports = mongoose.model('HR', HRSchema);
