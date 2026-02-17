const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema(
    { 
        department_name: {
            type: String, 
            required: true,
            trim: true,
            maxlength: 100,
            unique: true
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: null
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SuperAdmin',
            required: true
        }
    },
    { 
        timestamps: true,
        strict: false 
    }
);

module.exports = mongoose.model('Department', DepartmentSchema);
