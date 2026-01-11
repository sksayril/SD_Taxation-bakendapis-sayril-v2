const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema(
    {
        planName: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            maxlength: 100
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'INR',
            uppercase: true,
            maxlength: 3
        },
        duration: {
            type: Number,
            required: true,
            min: 1,
            comment: 'Duration in months'
        },
        features: {
            type: [String],
            default: []
        },
        maxEmployees: {
            type: Number,
            default: null,
            comment: 'Maximum number of employees allowed (null = unlimited)'
        },
        maxAdmins: {
            type: Number,
            default: 1,
            min: 1,
            comment: 'Maximum number of admins allowed'
        },
        isActive: {
            type: Boolean,
            default: true
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

// Index for faster queries
SubscriptionPlanSchema.index({ isActive: 1, planName: 1 });

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);


