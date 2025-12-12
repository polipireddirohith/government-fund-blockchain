const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    fundId: {
        type: Number,
        required: true
    },
    fund: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fund',
        required: true
    },
    transactionHash: {
        type: String,
        required: true,
        unique: true
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['allocation', 'approval', 'release', 'milestone'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'failed'],
        default: 'pending'
    },
    blockNumber: {
        type: Number
    },
    gasUsed: {
        type: String
    },
    remarks: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

transactionSchema.index({ fundId: 1, timestamp: -1 });
transactionSchema.index({ transactionHash: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
