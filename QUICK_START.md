# Quick Start Commands

## 🚀 Push to GitHub (IMPORTANT!)

```bash
# 1. Create a new repository on GitHub.com
#    Name: government-fund-blockchain
#    Description: Government Fund Allocation System using Blockchain
#    Public repository

# 2. Run these commands in d:\govfund directory:

git remote add origin https://github.com/YOUR_USERNAME/government-fund-blockchain.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username!

---

## 💻 Local Development Setup

### Prerequisites
```bash
# Install Node.js (v16+)
# Install MongoDB
# Install Git
# Install MetaMask browser extension
```

### Installation

```bash
# 1. Install Blockchain Dependencies
cd d:\govfund\blockchain
npm install

# 2. Install Backend Dependencies
cd ..\backend
npm install

# 3. Install Frontend Dependencies
cd ..\frontend
npm install
```

### Running the Project

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Local Blockchain
cd d:\govfund\blockchain
npx hardhat node

# Terminal 3: Deploy Smart Contract
cd d:\govfund\blockchain
npx hardhat run scripts\deploy.js --network localhost
# Copy the CONTRACT_ADDRESS from output

# Terminal 4: Start Backend
cd d:\govfund\backend
# Create .env file with:
#   PORT=5000
#   MONGODB_URI=mongodb://localhost:27017/govfund
#   JWT_SECRET=your_secret_key
#   BLOCKCHAIN_RPC_URL=http://localhost:8545
#   CONTRACT_ADDRESS=<paste_address_from_step_3>
#   PRIVATE_KEY=<from_hardhat_node_output>

npm run dev

# Terminal 5: Start Frontend
cd d:\govfund\frontend
# Create .env file with:
#   REACT_APP_API_URL=http://localhost:5000/api
#   REACT_APP_CONTRACT_ADDRESS=<paste_address>

npm start
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Blockchain: http://localhost:8545

---

## 🧪 Testing

```bash
# Test Smart Contracts
cd d:\govfund\blockchain
npx hardhat test

# Test Coverage
npx hardhat coverage
```

---

## 📦 Docker Setup (Alternative)

```bash
cd d:\govfund
docker-compose up -d

