const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const Fund = require('../models/Fund');
const Transaction = require('../models/Transaction');
const { auth, authorize } = require('../middleware/auth');

// Contract ABI (simplified - import full ABI in production)
const contractABI = require('../../blockchain/artifacts/contracts/FundAllocation.sol/FundAllocation.json').abi;

// Get blockchain provider
const getProvider = () => {
    return new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545');
};

// Get contract instance
const getContract = (signer = null) => {
    const provider = getProvider();
    const contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        contractABI,
        signer || provider
    );
    return contract;
};

// Allocate fund on blockchain
router.post('/allocate', [auth, authorize('authority', 'admin')], async (req, res) => {
    try {
        const { fundId } = req.body;

        const fund = await Fund.findOne({ fundId });

        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Fund not found'
            });
        }

        // Create wallet from private key
        const provider = getProvider();
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contract = getContract(wallet);

        // Call smart contract
        const tx = await contract.allocateFund(
            fund.projectName,
            fund.description,
            getCategoryIndex(fund.category),
            ethers.parseEther(fund.totalAmount.toString()),
            fund.beneficiaryWallet
        );

        await tx.wait();

        // Update fund with transaction hash
        fund.transactionHash = tx.hash;
        fund.blockchainStatus = 'confirmed';
        await fund.save();

        // Save transaction
        const transaction = new Transaction({
            fundId: fund.fundId,
            fund: fund._id,
            transactionHash: tx.hash,
            from: wallet.address,
            to: process.env.CONTRACT_ADDRESS,
            amount: fund.totalAmount,
            type: 'allocation',
            status: 'confirmed'
        });

        await transaction.save();

        res.json({
            success: true,
            message: 'Fund allocated on blockchain',
            data: {
                transactionHash: tx.hash,
                fund
            }
        });
    } catch (error) {
        console.error('Blockchain allocation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to allocate on blockchain',
            error: error.message
        });
    }
});

// Release fund on blockchain
router.post('/release', [auth, authorize('authority', 'admin')], async (req, res) => {
    try {
        const { fundId, amount } = req.body;

        const fund = await Fund.findOne({ fundId });

        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Fund not found'
            });
        }

        if (fund.status !== 'Approved') {
            return res.status(400).json({
                success: false,
                message: 'Fund must be approved first'
            });
        }

        const provider = getProvider();
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contract = getContract(wallet);

        const releaseAmount = ethers.parseEther(amount.toString());

        // Release fund
        const tx = await contract.releaseFund(fundId, releaseAmount, {
            value: releaseAmount
        });

        await tx.wait();

        // Update fund
        fund.releasedAmount += amount;
        fund.status = 'Released';

        if (fund.releasedAmount >= fund.totalAmount) {
            fund.status = 'Completed';
        }

        await fund.save();

        // Save transaction
        const transaction = new Transaction({
            fundId: fund.fundId,
            fund: fund._id,
            transactionHash: tx.hash,
            from: wallet.address,
            to: fund.beneficiaryWallet,
            amount: amount,
            type: 'release',
            status: 'confirmed'
        });

        await transaction.save();

        // Emit socket event
        const io = req.app.get('io');
        io.emit('fundReleased', { fund, transaction });

        res.json({
            success: true,
            message: 'Fund released successfully',
            data: {
                transactionHash: tx.hash,
                fund,
                transaction
            }
        });
    } catch (error) {
        console.error('Blockchain release error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to release fund',
            error: error.message
        });
    }
});

// Get fund details from blockchain
router.get('/fund/:fundId', auth, async (req, res) => {
    try {
        const contract = getContract();
        const fundDetails = await contract.getFundDetails(req.params.fundId);

        res.json({
            success: true,
            data: {
                projectName: fundDetails[0],
                totalAmount: ethers.formatEther(fundDetails[1]),
                releasedAmount: ethers.formatEther(fundDetails[2]),
                beneficiary: fundDetails[3],
                status: fundDetails[4],
                createdAt: new Date(Number(fundDetails[5]) * 1000)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blockchain data',
            error: error.message
        });
    }
});

// Get transactions for a fund
router.get('/transactions/:fundId', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ fundId: req.params.fundId })
            .sort({ timestamp: -1 });

        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
});

// Helper function
function getCategoryIndex(category) {
    const categories = ['Education', 'Healthcare', 'Infrastructure', 'SocialWelfare', 'Agriculture', 'Other'];
    return categories.indexOf(category);
}

module.exports = router;
