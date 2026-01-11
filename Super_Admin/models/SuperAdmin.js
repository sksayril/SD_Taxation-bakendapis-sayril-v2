const mongoose = require('mongoose');
const SuperAdminSchema = new mongoose.Schema(
    { 
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true, lowercase: true, trim: true},
        password: {type: String, required: true},
        role: {type: String, default: 'superadmin'},
        resetPasswordToken: {type: String},
        resetPasswordExpires: {type: Date}
    },
    {timestamps: true},
    { strict: false }
);

// Transform toJSON to ensure password is never returned
SuperAdminSchema.methods.toJSON = function() {
    const adminObject = this.toObject();
    delete adminObject.password;
    delete adminObject.resetPasswordToken;
    delete adminObject.resetPasswordExpires;
    return adminObject;
};

module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);