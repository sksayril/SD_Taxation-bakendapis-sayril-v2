const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
    { 
        fullname: {
            type: String, 
            required: true,
            trim: true,
            maxlength: 100
        },
        username: {
            type: String, 
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 50
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
            required: true
        },
        originalPassword: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            enum: ['Admin'],
            default: 'Admin'
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20
        },
        adminArea: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true
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
        },
        permissions: {
            hrm: {
                access: {
                    type: Boolean,
                    default: false
                },
                canCreate: {
                    type: Boolean,
                    default: false
                },
                canRead: {
                    type: Boolean,
                    default: false
                },
                canUpdate: {
                    type: Boolean,
                    default: false
                },
                canDelete: {
                    type: Boolean,
                    default: false
                }
            },
            crm: {
                access: {
                    type: Boolean,
                    default: false
                },
                canCreate: {
                    type: Boolean,
                    default: false
                },
                canRead: {
                    type: Boolean,
                    default: false
                },
                canUpdate: {
                    type: Boolean,
                    default: false
                },
                canDelete: {
                    type: Boolean,
                    default: false
                }
            },
            erp: {
                access: {
                    type: Boolean,
                    default: false
                },
                canCreate: {
                    type: Boolean,
                    default: false
                },
                canRead: {
                    type: Boolean,
                    default: false
                },
                canUpdate: {
                    type: Boolean,
                    default: false
                },
                canDelete: {
                    type: Boolean,
                    default: false
                }
            },
            payroll: {
                access: {
                    type: Boolean,
                    default: false
                },
                canCreate: {
                    type: Boolean,
                    default: false
                },
                canRead: {
                    type: Boolean,
                    default: false
                },
                canUpdate: {
                    type: Boolean,
                    default: false
                },
                canDelete: {
                    type: Boolean,
                    default: false
                }
            }
        },
        lastLogin: {
            type: Date,
            default: null
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        }
    },
    {timestamps: true},
    { strict: false }
);

// Transform toJSON to ensure password is never returned (except for SuperAdmin)
AdminSchema.methods.toJSON = function(options = {}) {
    const adminObject = this.toObject();
    
    // Only exclude password if not explicitly requested by SuperAdmin
    if (!options.includePassword) {
        delete adminObject.password;
        delete adminObject.originalPassword;
        delete adminObject.resetPasswordToken;
        delete adminObject.resetPasswordExpires;
    }
    
    return adminObject;
};

module.exports = mongoose.model('Admin', AdminSchema);
