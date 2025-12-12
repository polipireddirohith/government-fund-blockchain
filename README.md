# Government Fund Allocation and Tracking System

## 🚀 Overview
A decentralized blockchain-based system for transparent government fund allocation and tracking. This system ensures accountability, reduces corruption, and provides real-time visibility into fund utilization.

## 🎯 Key Features

### Blockchain Integration
- **Immutable Records**: All fund allocations and transactions recorded on Ethereum blockchain
- **Smart Contracts**: Automated fund release based on predefined conditions
- **Transparency**: Public audit trail for all fund movements
- **Decentralization**: No single point of failure or manipulation

### Core Functionalities
1. **Fund Allocation**
   - Government authorities can allocate funds to various projects
   - Multi-level approval workflow
   - Budget categorization (Education, Healthcare, Infrastructure, etc.)

2. **Fund Tracking**
   - Real-time tracking of fund utilization
   - Milestone-based fund release
   - Automatic notifications on fund movements

3. **Beneficiary Management**
   - Register beneficiaries (individuals, organizations, contractors)
   - KYC verification
   - Wallet integration for direct fund transfer

4. **Reporting & Analytics**
   - Interactive dashboards
   - Fund utilization reports
   - Anomaly detection
   - Export capabilities (PDF, Excel)

5. **Access Control**
   - Role-based permissions (Admin, Authority, Auditor, Beneficiary)
   - Multi-signature approvals for large transactions
   - Activity logging

## 🏗️ Technology Stack

### Frontend
- **React.js** - UI framework
- **Web3.js / Ethers.js** - Blockchain interaction
- **Material-UI** - Component library
- **Redux** - State management
- **Chart.js** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database for off-chain data
- **JWT** - Authentication
- **Socket.io** - Real-time updates

### Blockchain
- **Solidity** - Smart contract language
- **Hardhat** - Development environment
- **Ethereum** - Blockchain platform
- **IPFS** - Decentralized storage for documents

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Ganache** - Local blockchain for testing

## 📁 Project Structure

```
govfund/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Utility functions
│   ├── config/             # Configuration files
│   └── server.js           # Entry point
│
├── blockchain/             # Smart contracts
│   ├── contracts/          # Solidity contracts
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.js   # Hardhat configuration
│
├── frontend/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── redux/          # State management
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
│
├── docs/                   # Documentation
├── docker-compose.yml      # Docker configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- MetaMask wallet
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/govfund.git
cd govfund
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Install Blockchain Dependencies**
```bash
cd ../blockchain
npm install
```

5. **Environment Setup**

Create `.env` files in respective directories:

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/govfund
JWT_SECRET=your_jwt_secret_key
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=your_deployed_contract_address
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_BLOCKCHAIN_NETWORK=localhost
```

**Blockchain (.env)**
```env
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_key
ETHERSCAN_API_KEY=your_etherscan_key
```

### Running the Application

1. **Start MongoDB**
```bash
mongod
```

2. **Start Local Blockchain**
```bash
cd blockchain
npx hardhat node
```

3. **Deploy Smart Contracts**
```bash
npx hardhat run scripts/deploy.js --network localhost
```

4. **Start Backend Server**
```bash
cd backend
npm run dev
```

5. **Start Frontend**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Blockchain: http://localhost:8545

## 🔐 Smart Contract Functions

### Main Contract: `FundAllocation.sol`

- `allocateFund()` - Allocate funds to a project
- `approveFund()` - Approve fund allocation (multi-sig)
- `releaseFund()` - Release funds to beneficiary
- `trackFund()` - Track fund utilization
- `updateMilestone()` - Update project milestone
- `getFundDetails()` - Get fund allocation details
- `getTransactionHistory()` - Get complete transaction history

## 📊 Use Cases

1. **Education Sector**
   - Scholarship distribution
   - School infrastructure funding
   - Teacher salary disbursement

2. **Healthcare**
   - Hospital equipment procurement
   - Medicine distribution
   - Health insurance claims

3. **Infrastructure**
   - Road construction projects
   - Public building development
   - Utility services

4. **Social Welfare**
   - Pension distribution
   - Subsidy allocation
   - Disaster relief funds

## 🧪 Testing

### Smart Contract Tests
```bash
cd blockchain
npx hardhat test
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

## 🔒 Security Features

- **Multi-signature Approvals**: Large transactions require multiple approvals
- **Role-based Access Control**: Strict permission management
- **Encryption**: Sensitive data encrypted at rest and in transit
- **Audit Logs**: Complete activity tracking
- **Smart Contract Auditing**: Contracts audited for vulnerabilities

## 📈 Future Enhancements

- [ ] Mobile application (React Native)
- [ ] AI-based fraud detection
- [ ] Integration with government databases
- [ ] Biometric authentication
- [ ] Multi-chain support (Polygon, BSC)
- [ ] Advanced analytics with ML
- [ ] Automated compliance checking

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Ethereum Foundation
- OpenZeppelin for secure smart contract libraries
- The open-source community

## 📞 Support

For support, email your.email@example.com or create an issue in the repository.

---

**Note**: This is a college major project demonstrating blockchain technology implementation for government fund management. It showcases skills in full-stack development, blockchain integration, and system design.
