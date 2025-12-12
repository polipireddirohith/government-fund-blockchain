# Project Documentation

## Government Fund Allocation and Tracking System

### Table of Contents
1. [System Architecture](#system-architecture)
2. [Smart Contract Details](#smart-contract-details)
3. [API Documentation](#api-documentation)
4. [Database Schema](#database-schema)
5. [Security Considerations](#security-considerations)
6. [Deployment Guide](#deployment-guide)

## System Architecture

### Overview
The system follows a three-tier architecture:

```
┌─────────────────┐
│   Frontend      │  React.js + Web3.js
│   (React App)   │  
└────────┬────────┘
         │
         │ REST API / WebSocket
         │
┌────────▼────────┐
│   Backend       │  Node.js + Express
│   (API Server)  │  MongoDB
└────────┬────────┘
         │
         │ Web3 / Ethers.js
         │
┌────────▼────────┐
│   Blockchain    │  Ethereum Network
│  (Smart Contract)│  Solidity
└─────────────────┘
```

### Components

#### 1. Frontend Layer
- **Technology**: React.js with Material-UI
- **Responsibilities**:
  - User interface rendering
  - Wallet connection (MetaMask)
  - Real-time updates via Socket.IO
  - Data visualization
  - Form validation

#### 2. Backend Layer
- **Technology**: Node.js with Express.js
- **Responsibilities**:
  - RESTful API endpoints
  - Authentication & Authorization (JWT)
  - Database operations (MongoDB)
  - Blockchain interaction
  - Business logic
  - Real-time notifications

#### 3. Blockchain Layer
- **Technology**: Ethereum with Solidity
- **Responsibilities**:
  - Immutable record keeping
  - Fund allocation logic
  - Multi-signature approvals
  - Transaction validation
  - Event emission

## Smart Contract Details

### FundAllocation.sol

#### Key Features
1. **Role-Based Access Control**
   - Admin Role: System administration
   - Authority Role: Fund allocation and approval
   - Auditor Role: Verification and auditing

2. **Fund Lifecycle**
   ```
   Pending → Approved → Released → Completed
                ↓
            Rejected
   ```

3. **Multi-Signature Approval**
   - Configurable approval threshold
   - Prevents self-approval
   - Tracks approval history

#### Main Functions

```solidity
// Allocate a new fund
function allocateFund(
    string memory _projectName,
    string memory _description,
    Category _category,
    uint256 _amount,
    address _beneficiary
) external returns (uint256)

// Approve fund allocation
function approveFund(uint256 _fundId) external

// Release fund to beneficiary
function releaseFund(uint256 _fundId, uint256 _amount) external payable

// Add milestone
function addMilestone(
    uint256 _fundId,
    string memory _description,
    uint256 _amount,
    uint256 _deadline
) external returns (uint256)
```

#### Events

```solidity
event FundAllocated(uint256 indexed fundId, string projectName, uint256 amount, address indexed beneficiary, address indexed allocatedBy)
event FundApproved(uint256 indexed fundId, address indexed approver, uint256 approvalCount)
event FundReleased(uint256 indexed fundId, uint256 amount, address indexed beneficiary)
event MilestoneAdded(uint256 indexed fundId, uint256 indexed milestoneId, uint256 amount)
event MilestoneCompleted(uint256 indexed fundId, uint256 indexed milestoneId, string proofDocument)
```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "beneficiary",
  "walletAddress": "0x...",
  "organization": "ABC Corp"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/login
Login user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Fund Endpoints

#### GET /api/funds
Get all funds (with filters)

**Query Parameters:**
- `status`: Filter by status (Pending, Approved, Released, Completed)
- `category`: Filter by category
- `beneficiary`: Filter by beneficiary ID

#### POST /api/funds
Create new fund allocation (Authority only)

**Request Body:**
```json
{
  "projectName": "School Building",
  "description": "Construction of new school",
  "category": "Education",
  "totalAmount": 1000000,
  "beneficiaryId": "user_id_here",
  "milestones": [
    {
      "description": "Foundation work",
      "amount": 300000,
      "deadline": "2025-06-30"
    }
  ]
}
```

#### POST /api/funds/:id/approve
Approve fund allocation

#### GET /api/funds/stats/overview
Get fund statistics

### Blockchain Endpoints

#### POST /api/blockchain/allocate
Allocate fund on blockchain

#### POST /api/blockchain/release
Release fund on blockchain

#### GET /api/blockchain/fund/:fundId
Get fund details from blockchain

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum['admin', 'authority', 'auditor', 'beneficiary'],
  walletAddress: String,
  organization: String,
  kycVerified: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Fund Collection
```javascript
{
  _id: ObjectId,
  fundId: Number (unique),
  projectName: String,
  description: String,
  category: Enum,
  totalAmount: Number,
  releasedAmount: Number,
  beneficiary: ObjectId (ref: User),
  beneficiaryWallet: String,
  allocatedBy: ObjectId (ref: User),
  status: Enum,
  approvals: [{
    authority: ObjectId,
    approvedAt: Date,
    remarks: String
  }],
  milestones: [{ ... }],
  transactionHash: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Collection
```javascript
{
  _id: ObjectId,
  fundId: Number,
  fund: ObjectId (ref: Fund),
  transactionHash: String (unique),
  from: String,
  to: String,
  amount: Number,
  type: Enum['allocation', 'approval', 'release', 'milestone'],
  status: Enum['pending', 'confirmed', 'failed'],
  blockNumber: Number,
  timestamp: Date
}
```

## Security Considerations

### 1. Smart Contract Security
- **Access Control**: Role-based permissions using OpenZeppelin's AccessControl
- **Reentrancy Protection**: ReentrancyGuard for fund transfers
- **Pausable**: Emergency stop mechanism
- **Input Validation**: Comprehensive checks on all inputs

### 2. Backend Security
- **Authentication**: JWT with secure secret
- **Password Hashing**: bcrypt with salt
- **Rate Limiting**: Prevents DDoS attacks
- **Helmet**: Security headers
- **CORS**: Controlled cross-origin requests
- **Input Validation**: express-validator

### 3. Frontend Security
- **XSS Prevention**: React's built-in escaping
- **CSRF Protection**: Token-based authentication
- **Secure Storage**: Sensitive data in environment variables
- **Wallet Security**: MetaMask integration

## Deployment Guide

### Prerequisites
- Node.js v16+
- MongoDB
- Ethereum node (or Infura/Alchemy)
- MetaMask wallet

### Local Development

1. **Start MongoDB**
```bash
mongod
```

2. **Deploy Smart Contract**
```bash
cd blockchain
npm install
npx hardhat node  # In separate terminal
npx hardhat run scripts/deploy.js --network localhost
```

3. **Start Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

4. **Start Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your values
npm start
```

### Production Deployment

#### Smart Contract (Ethereum Mainnet/Testnet)
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

#### Backend (Heroku/AWS/DigitalOcean)
```bash
# Set environment variables
# Deploy using your preferred platform
```

#### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy build folder
```

## Testing

### Smart Contract Tests
```bash
cd blockchain
npx hardhat test
npx hardhat coverage
```

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Performance Optimization

1. **Database Indexing**
   - Index on frequently queried fields
   - Compound indexes for complex queries

2. **Caching**
   - Redis for session management
   - Cache blockchain data

3. **Frontend Optimization**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Minification

## Monitoring & Logging

1. **Backend Logging**
   - Winston for structured logging
   - Log levels: error, warn, info, debug

2. **Blockchain Events**
   - Event listeners for contract events
   - Transaction monitoring

3. **Analytics**
   - User activity tracking
   - Fund utilization metrics
   - System performance metrics

## Future Enhancements

1. **Advanced Features**
   - AI-based fraud detection
   - Predictive analytics
   - Automated compliance checking
   - Multi-chain support

2. **Mobile Application**
   - React Native app
   - Biometric authentication

3. **Integration**
   - Government database integration
   - Third-party audit tools
   - Payment gateways

## Support & Maintenance

### Regular Tasks
- Database backups
- Security audits
- Dependency updates
- Performance monitoring
- User feedback collection

### Troubleshooting
- Check logs for errors
- Verify blockchain connection
- Validate environment variables
- Test API endpoints
- Review smart contract events

---

For more information, please refer to the README.md or contact the development team.
