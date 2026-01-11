const mongoose = require('mongoose');

const CompanySubscriptionSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
            unique: true
        },
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubscriptionPlan',
            required: true
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        endDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled', 'suspended'],
            default: 'active'
        },
        autoRenew: {
            type: Boolean,
            default: false
        },
        assigned_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SuperAdmin',
            required: true
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 500
        }
    },
    {
        timestamps: true,
        strict: false
    }
);

// Index for faster queries
CompanySubscriptionSchema.index({ company: 1, status: 1 });
CompanySubscriptionSchema.index({ endDate: 1, status: 1 });

// Virtual to check if subscription is currently active
CompanySubscriptionSchema.virtual('isActive').get(function() {
    const now = new Date();
    return this.status === 'active' && 
           this.startDate <= now && 
           this.endDate >= now;
});

// Method to check if subscription is valid
CompanySubscriptionSchema.methods.isValid = function() {
    const now = new Date();
    return this.status === 'active' && 
           this.startDate <= now && 
           this.endDate >= now;
};

// Pre-save hook to update status based on dates
CompanySubscriptionSchema.pre('save', function(next) {
    const now = new Date();
    if (this.status === 'active' && this.endDate < now) {
        this.status = 'expired';
    }
    next();
});

module.exports = mongoose.model('CompanySubscription', CompanySubscriptionSchema);

