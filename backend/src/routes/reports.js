const express = require('express');
const router = express.Router();
const Fund = require('../models/Fund');
const Transaction = require('../models/Transaction');
const { auth, authorize } = require('../middleware/auth');

// Generate fund utilization report
router.get('/utilization', [auth, authorize('admin', 'auditor')], async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const funds = await Fund.find(filter)
            .populate('beneficiary', 'name organization')
            .populate('allocatedBy', 'name');

        const report = {
            totalFunds: funds.length,
            totalAllocated: funds.reduce((sum, f) => sum + f.totalAmount, 0),
            totalReleased: funds.reduce((sum, f) => sum + f.releasedAmount, 0),
            totalPending: funds.reduce((sum, f) => sum + (f.totalAmount - f.releasedAmount), 0),
            byCategory: {},
            byStatus: {},
            funds: funds
        };

        // Group by category
        funds.forEach(fund => {
            if (!report.byCategory[fund.category]) {
                report.byCategory[fund.category] = {
                    count: 0,
                    allocated: 0,
                    released: 0
                };
            }
            report.byCategory[fund.category].count++;
            report.byCategory[fund.category].allocated += fund.totalAmount;
            report.byCategory[fund.category].released += fund.releasedAmount;
        });

        // Group by status
        funds.forEach(fund => {
            if (!report.byStatus[fund.status]) {
                report.byStatus[fund.status] = 0;
            }
            report.byStatus[fund.status]++;
        });

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate report',
            error: error.message
        });
    }
});

// Transaction audit report
router.get('/audit', [auth, authorize('admin', 'auditor')], async (req, res) => {
    try {
        const { fundId, startDate, endDate } = req.query;

        const filter = {};
        if (fundId) filter.fundId = fundId;
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(filter)
            .populate('fund', 'projectName category')
            .sort({ timestamp: -1 });

        const report = {
            totalTransactions: transactions.length,
            totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
            byType: {},
            byStatus: {},
            transactions: transactions
        };

        // Group by type
        transactions.forEach(tx => {
            if (!report.byType[tx.type]) {
                report.byType[tx.type] = { count: 0, amount: 0 };
            }
            report.byType[tx.type].count++;
            report.byType[tx.type].amount += tx.amount;
        });

        // Group by status
        transactions.forEach(tx => {
            if (!report.byStatus[tx.status]) {
                report.byStatus[tx.status] = 0;
            }
            report.byStatus[tx.status]++;
        });

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate audit report',
            error: error.message
        });
    }
});

module.exports = router;
