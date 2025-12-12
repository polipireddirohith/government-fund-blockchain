const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
    fundId: {
        type: Number,
        required: true,
        unique: true
    },
    projectName: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    category: {
        type: String,
        enum: ['Education', 'Healthcare', 'Infrastructure', 'SocialWelfare', 'Agriculture', 'Other'],
        required: true
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: 0
    },
    releasedAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    beneficiary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    beneficiaryWallet: {
        type: String,
        required: true
    },
    allocatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Released', 'Completed', 'Rejected'],
        default: 'Pending'
    },
    approvals: [{
        authority: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvedAt: {
            type: Date,
            default: Date.now
        },
        remarks: String
    }],
    milestones: [{
        description: String,
        amount: Number,
        deadline: Date,
        status: {
            type: String,
            enum: ['Pending', 'InProgress', 'Completed', 'Verified'],
            default: 'Pending'
        },
        proofDocument: String,
        completedAt: Date
    }],
    documents: [{
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    transactionHash: {
        type: String
    },
    blockchainStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'failed'],
        default: 'pending'
    },
    remarks: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp
fundSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate remaining amount
fundSchema.virtual('remainingAmount').get(function () {
    return this.totalAmount - this.releasedAmount;
});

// Calculate completion percentage
fundSchema.virtual('completionPercentage').get(function () {
    return (this.releasedAmount / this.totalAmount) * 100;
});

fundSchema.set('toJSON', { virtuals: true });
fundSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Fund', fundSchema);
