import { ethers } from 'ethers';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
    "function allocateFund(string memory _projectName, string memory _description, uint8 _category, uint256 _amount, address _beneficiary) external returns (uint256)",
    "function approveFund(uint256 _fundId) external",
    "function releaseFund(uint256 _fundId, uint256 _amount) external payable",
    "function getFundDetails(uint256 _fundId) external view returns (string memory, uint256, uint256, address, uint8, uint256)",
    "function getTotalFunds() external view returns (uint256)",
    "event FundAllocated(uint256 indexed fundId, string projectName, uint256 amount, address indexed beneficiary, address indexed allocatedBy)",
    "event FundApproved(uint256 indexed fundId, address indexed approver, uint256 approvalCount)",
    "event FundReleased(uint256 indexed fundId, uint256 amount, address indexed beneficiary)"
];

export const connectWallet = async () => {
    if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
    }

    try {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
        });
        return accounts[0];
    } catch (error) {
        throw new Error('Failed to connect wallet');
    }
};

export const getProvider = () => {
    if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
    }
    return new ethers.BrowserProvider(window.ethereum);
};

export const getContract = async () => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const allocateFundOnChain = async (projectName, description, category, amount, beneficiary) => {
    const contract = await getContract();
    const tx = await contract.allocateFund(
        projectName,
        description,
        category,
        ethers.parseEther(amount.toString()),
        beneficiary
    );
    await tx.wait();
    return tx.hash;
};

export const releaseFundOnChain = async (fundId, amount) => {
    const contract = await getContract();
    const tx = await contract.releaseFund(
        fundId,
        ethers.parseEther(amount.toString()),
        { value: ethers.parseEther(amount.toString()) }
    );
    await tx.wait();
    return tx.hash;
};

export const getFundDetailsFromChain = async (fundId) => {
    const contract = await getContract();
    const details = await contract.getFundDetails(fundId);
    return {
        projectName: details[0],
        totalAmount: ethers.formatEther(details[1]),
        releasedAmount: ethers.formatEther(details[2]),
        beneficiary: details[3],
        status: details[4],
        createdAt: new Date(Number(details[5]) * 1000),
    };
};
