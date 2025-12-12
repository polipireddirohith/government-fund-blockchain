const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Fund = require('../models/Fund');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Get all funds
router.get('/', auth, async (req, res) => {
    try {
        const { status, category, beneficiary } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (beneficiary) filter.beneficiary = beneficiary;

        // Role-based filtering
        if (req.user.role === 'beneficiary') {
            filter.beneficiary = req.userId;
        } else if (req.user.role === 'authority') {
            // Authorities can see funds they allocated or need to approve
            // For simplicity, showing all funds
        }

        const funds = await Fund.find(filter)
            .populate('beneficiary', 'name email organization')
            .populate('allocatedBy', 'name email organization')
            .populate('approvals.authority', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: funds.length,
            data: funds
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch funds',
            error: error.message
        });
    }
});

// Get single fund
router.get('/:id', auth, async (req, res) => {
    try {
        const fund = await Fund.findById(req.params.id)
            .populate('beneficiary', 'name email organization walletAddress')
            .populate('allocatedBy', 'name email organization')
            .populate('approvals.authority', 'name email');

        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Fund not found'
            });
        }

        res.json({
            success: true,
            data: fund
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch fund',
            error: error.message
        });
    }
});

// Create fund allocation
router.post('/', [
    auth,
    authorize('authority', 'admin'),
    body('projectName').trim().notEmpty().withMessage('Project name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').isIn(['Education', 'Healthcare', 'Infrastructure', 'SocialWelfare', 'Agriculture', 'Other']),
    body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
    body('beneficiaryId').notEmpty().withMessage('Beneficiary is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { projectName, description, category, totalAmount, beneficiaryId, milestones } = req.body;

        // Verify beneficiary exists
        const beneficiary = await User.findById(beneficiaryId);
        if (!beneficiary) {
            return res.status(404).json({
                success: false,
                message: 'Beneficiary not found'
            });
        }

        if (!beneficiary.walletAddress) {
            return res.status(400).json({
                success: false,
                message: 'Beneficiary must have a wallet address'
            });
        }

        // Get next fund ID
        const lastFund = await Fund.findOne().sort({ fundId: -1 });
        const fundId = lastFund ? lastFund.fundId + 1 : 1;

        const fund = new Fund({
            fundId,
            projectName,
            description,
            category,
            totalAmount,
            beneficiary: beneficiaryId,
            beneficiaryWallet: beneficiary.walletAddress,
            allocatedBy: req.userId,
            milestones: milestones || []
        });

        await fund.save();

        // Emit socket event
        const io = req.app.get('io');
        io.emit('fundAllocated', fund);

        res.status(201).json({
            success: true,
            message: 'Fund allocated successfully',
            data: fund
        });
    } catch (error) {
        console.error('Fund allocation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to allocate fund',
            error: error.message
        });
    }
});

// Approve fund
router.post('/:id/approve', [
    auth,
    authorize('authority', 'admin')
], async (req, res) => {
    try {
        const fund = await Fund.findById(req.params.id);

        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Fund not found'
            });
        }

        if (fund.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Fund is not in pending status'
            });
        }

        // Check if already approved by this authority
        const alreadyApproved = fund.approvals.some(
            approval => approval.authority.toString() === req.userId.toString()
        );

        if (alreadyApproved) {
            return res.status(400).json({
                success: false,
                message: 'Already approved by you'
            });
        }

        // Check if allocated by same person
        if (fund.allocatedBy.toString() === req.userId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot approve your own allocation'
            });
        }

        fund.approvals.push({
            authority: req.userId,
            remarks: req.body.remarks
        });

        // Check if enough approvals (default: 2)
        if (fund.approvals.length >= 2) {
            fund.status = 'Approved';
        }

        await fund.save();

        // Emit socket event
        const io = req.app.get('io');
        io.emit('fundApproved', fund);

        res.json({
            success: true,
            message: 'Fund approved successfully',
            data: fund
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to approve fund',
            error: error.message
        });
    }
});

// Update fund status
router.patch('/:id/status', [
    auth,
    authorize('authority', 'admin')
], async (req, res) => {
    try {
        const { status } = req.body;

        const fund = await Fund.findById(req.params.id);

        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Fund not found'
            });
        }

        fund.status = status;
        await fund.save();

        res.json({
            success: true,
            message: 'Fund status updated',
            data: fund
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        });
    }
});

// Add milestone
router.post('/:id/milestones', [
    auth,
    authorize('authority', 'admin')
], async (req, res) => {
    try {
        const fund = await Fund.findById(req.params.id);

        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Fund not found'
            });
        }

        fund.milestones.push(req.body);
        await fund.save();

        res.json({
            success: true,
            message: 'Milestone added successfully',
            data: fund
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add milestone',
            error: error.message
        });
    }
});

// Get statistics
router.get('/stats/overview', auth, async (req, res) => {
    try {
        const totalFunds = await Fund.countDocuments();
        const totalAllocated = await Fund.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalReleased = await Fund.aggregate([
            { $group: { _id: null, total: { $sum: '$releasedAmount' } } }
        ]);

        const byStatus = await Fund.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const byCategory = await Fund.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            success: true,
            data: {
                totalFunds,
                totalAllocated: totalAllocated[0]?.total || 0,
                totalReleased: totalReleased[0]?.total || 0,
                byStatus,
                byCategory
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
});

module.exports = router;
