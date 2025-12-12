// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title FundAllocation
 * @dev Smart contract for government fund allocation and tracking
 */
contract FundAllocation is AccessControl, ReentrancyGuard, Pausable {
    
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AUTHORITY_ROLE = keccak256("AUTHORITY_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    
    // Enums
    enum FundStatus { Pending, Approved, Released, Completed, Rejected }
    enum Category { Education, Healthcare, Infrastructure, SocialWelfare, Agriculture, Other }
    enum MilestoneStatus { Pending, InProgress, Completed, Verified }
    
    // Structs
    struct Fund {
        uint256 id;
        string projectName;
        string description;
        Category category;
        uint256 totalAmount;
        uint256 releasedAmount;
        address beneficiary;
        address allocatedBy;
        FundStatus status;
        uint256 createdAt;
        uint256 approvalCount;
        bool exists;
    }
    
    struct Milestone {
        uint256 id;
        uint256 fundId;
        string description;
        uint256 amount;
        uint256 deadline;
        MilestoneStatus status;
        string proofDocument; // IPFS hash
        uint256 completedAt;
    }
    
    struct Transaction {
        uint256 id;
        uint256 fundId;
        uint256 amount;
        address from;
        address to;
        uint256 timestamp;
        string remarks;
    }
    
    // State variables
    uint256 private fundCounter;
    uint256 private milestoneCounter;
    uint256 private transactionCounter;
    uint256 public requiredApprovals = 2;
    
    mapping(uint256 => Fund) public funds;
    mapping(uint256 => Milestone[]) public fundMilestones;
    mapping(uint256 => Transaction[]) public fundTransactions;
    mapping(uint256 => mapping(address => bool)) public fundApprovals;
    mapping(address => uint256[]) public beneficiaryFunds;
    mapping(address => uint256[]) public authorityFunds;
    
    // Events
    event FundAllocated(
        uint256 indexed fundId,
        string projectName,
        uint256 amount,
        address indexed beneficiary,
        address indexed allocatedBy
    );
    
    event FundApproved(
        uint256 indexed fundId,
        address indexed approver,
        uint256 approvalCount
    );
    
    event FundReleased(
        uint256 indexed fundId,
        uint256 amount,
        address indexed beneficiary
    );
    
    event MilestoneAdded(
        uint256 indexed fundId,
        uint256 indexed milestoneId,
        uint256 amount
    );
    
    event MilestoneCompleted(
        uint256 indexed fundId,
        uint256 indexed milestoneId,
        string proofDocument
    );
    
    event TransactionRecorded(
        uint256 indexed fundId,
        uint256 indexed transactionId,
        uint256 amount,
        address from,
        address to
    );
    
    // Modifiers
    modifier fundExists(uint256 _fundId) {
        require(funds[_fundId].exists, "Fund does not exist");
        _;
    }
    
    modifier onlyBeneficiary(uint256 _fundId) {
        require(
            funds[_fundId].beneficiary == msg.sender,
            "Only beneficiary can perform this action"
        );
        _;
    }
    
    /**
     * @dev Constructor - sets up roles
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(AUTHORITY_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }
    
    /**
     * @dev Allocate fund to a project
     */
    function allocateFund(
        string memory _projectName,
        string memory _description,
        Category _category,
        uint256 _amount,
        address _beneficiary
    ) external onlyRole(AUTHORITY_ROLE) whenNotPaused returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(_beneficiary != address(0), "Invalid beneficiary address");
        
        fundCounter++;
        
        Fund storage newFund = funds[fundCounter];
        newFund.id = fundCounter;
        newFund.projectName = _projectName;
        newFund.description = _description;
        newFund.category = _category;
        newFund.totalAmount = _amount;
        newFund.releasedAmount = 0;
        newFund.beneficiary = _beneficiary;
        newFund.allocatedBy = msg.sender;
        newFund.status = FundStatus.Pending;
        newFund.createdAt = block.timestamp;
        newFund.approvalCount = 0;
        newFund.exists = true;
        
        beneficiaryFunds[_beneficiary].push(fundCounter);
        authorityFunds[msg.sender].push(fundCounter);
        
        emit FundAllocated(fundCounter, _projectName, _amount, _beneficiary, msg.sender);
        
        return fundCounter;
    }
    
    /**
     * @dev Approve fund allocation
     */
    function approveFund(uint256 _fundId) 
        external 
        onlyRole(AUTHORITY_ROLE) 
        fundExists(_fundId) 
        whenNotPaused 
    {
        Fund storage fund = funds[_fundId];
        require(fund.status == FundStatus.Pending, "Fund is not in pending status");
        require(!fundApprovals[_fundId][msg.sender], "Already approved by this authority");
        require(fund.allocatedBy != msg.sender, "Cannot approve own allocation");
        
        fundApprovals[_fundId][msg.sender] = true;
        fund.approvalCount++;
        
        emit FundApproved(_fundId, msg.sender, fund.approvalCount);
        
        if (fund.approvalCount >= requiredApprovals) {
            fund.status = FundStatus.Approved;
        }
    }
    
    /**
     * @dev Release fund to beneficiary
     */
    function releaseFund(uint256 _fundId, uint256 _amount) 
        external 
        payable
        onlyRole(AUTHORITY_ROLE) 
        fundExists(_fundId) 
        nonReentrant 
        whenNotPaused 
    {
        Fund storage fund = funds[_fundId];
        require(fund.status == FundStatus.Approved || fund.status == FundStatus.Released, 
                "Fund must be approved first");
        require(_amount > 0, "Amount must be greater than 0");
        require(fund.releasedAmount + _amount <= fund.totalAmount, 
                "Amount exceeds total allocation");
        require(msg.value == _amount, "Sent value must match release amount");
        
        fund.releasedAmount += _amount;
        
        if (fund.status == FundStatus.Approved) {
            fund.status = FundStatus.Released;
        }
        
        if (fund.releasedAmount == fund.totalAmount) {
            fund.status = FundStatus.Completed;
        }
        
        // Record transaction
        _recordTransaction(_fundId, _amount, msg.sender, fund.beneficiary, "Fund release");
        
        // Transfer funds
        (bool success, ) = payable(fund.beneficiary).call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit FundReleased(_fundId, _amount, fund.beneficiary);
    }
    
    /**
     * @dev Add milestone to a fund
     */
    function addMilestone(
        uint256 _fundId,
        string memory _description,
        uint256 _amount,
        uint256 _deadline
    ) external onlyRole(AUTHORITY_ROLE) fundExists(_fundId) whenNotPaused returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        
        milestoneCounter++;
        
        Milestone memory newMilestone = Milestone({
            id: milestoneCounter,
            fundId: _fundId,
            description: _description,
            amount: _amount,
            deadline: _deadline,
            status: MilestoneStatus.Pending,
            proofDocument: "",
            completedAt: 0
        });
        
        fundMilestones[_fundId].push(newMilestone);
        
        emit MilestoneAdded(_fundId, milestoneCounter, _amount);
        
        return milestoneCounter;
    }
    
    /**
     * @dev Update milestone status
     */
    function updateMilestoneStatus(
        uint256 _fundId,
        uint256 _milestoneIndex,
        MilestoneStatus _status,
        string memory _proofDocument
    ) external fundExists(_fundId) whenNotPaused {
        require(_milestoneIndex < fundMilestones[_fundId].length, "Invalid milestone index");
        
        Milestone storage milestone = fundMilestones[_fundId][_milestoneIndex];
        
        if (_status == MilestoneStatus.Completed) {
            require(
                msg.sender == funds[_fundId].beneficiary || hasRole(AUTHORITY_ROLE, msg.sender),
                "Unauthorized"
            );
            milestone.completedAt = block.timestamp;
            milestone.proofDocument = _proofDocument;
            
            emit MilestoneCompleted(_fundId, milestone.id, _proofDocument);
        } else if (_status == MilestoneStatus.Verified) {
            require(hasRole(AUDITOR_ROLE, msg.sender), "Only auditor can verify");
        }
        
        milestone.status = _status;
    }
    
    /**
     * @dev Get fund details
     */
    function getFundDetails(uint256 _fundId) 
        external 
        view 
        fundExists(_fundId) 
        returns (
            string memory projectName,
            uint256 totalAmount,
            uint256 releasedAmount,
            address beneficiary,
            FundStatus status,
            uint256 createdAt
        ) 
    {
        Fund storage fund = funds[_fundId];
        return (
            fund.projectName,
            fund.totalAmount,
            fund.releasedAmount,
            fund.beneficiary,
            fund.status,
            fund.createdAt
        );
    }
    
    /**
     * @dev Get milestones for a fund
     */
    function getFundMilestones(uint256 _fundId) 
        external 
        view 
        fundExists(_fundId) 
        returns (Milestone[] memory) 
    {
        return fundMilestones[_fundId];
    }
    
    /**
     * @dev Get transactions for a fund
     */
    function getFundTransactions(uint256 _fundId) 
        external 
        view 
        fundExists(_fundId) 
        returns (Transaction[] memory) 
    {
        return fundTransactions[_fundId];
    }
    
    /**
     * @dev Get funds by beneficiary
     */
    function getBeneficiaryFunds(address _beneficiary) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return beneficiaryFunds[_beneficiary];
    }
    
    /**
     * @dev Record transaction internally
     */
    function _recordTransaction(
        uint256 _fundId,
        uint256 _amount,
        address _from,
        address _to,
        string memory _remarks
    ) private {
        transactionCounter++;
        
        Transaction memory newTransaction = Transaction({
            id: transactionCounter,
            fundId: _fundId,
            amount: _amount,
            from: _from,
            to: _to,
            timestamp: block.timestamp,
            remarks: _remarks
        });
        
        fundTransactions[_fundId].push(newTransaction);
        
        emit TransactionRecorded(_fundId, transactionCounter, _amount, _from, _to);
    }
    
    /**
     * @dev Set required approvals
     */
    function setRequiredApprovals(uint256 _count) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(_count > 0, "Must require at least 1 approval");
        requiredApprovals = _count;
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Get total funds count
     */
    function getTotalFunds() external view returns (uint256) {
        return fundCounter;
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
