const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', [auth, authorize('admin')], async (req, res) => {
    try {
        const { role, kycVerified } = req.query;
        const filter = {};

        if (role) filter.role = role;
        if (kycVerified !== undefined) filter.kycVerified = kycVerified === 'true';

        const users = await User.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
});

// Update user
router.put('/:id', [auth, authorize('admin')], async (req, res) => {
    try {
        const { role, isActive, kycVerified } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        if (kycVerified !== undefined) user.kycVerified = kycVerified;

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
});

module.exports = router;
