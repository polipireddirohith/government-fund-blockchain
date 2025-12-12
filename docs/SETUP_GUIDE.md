# Government Fund Allocation System - Setup Guide

## Quick Start Guide

### Option 1: Using Docker (Recommended)

1. **Install Docker and Docker Compose**
   - Download from: https://www.docker.com/

2. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd govfund
   ```

3. **Configure Environment**
   ```bash
   cp backend/.env.example backend/.env
   cp blockchain/.env.example blockchain/.env
   # Edit the .env files with your values
   ```

4. **Start All Services**
   ```bash
   docker-compose up -d
   ```

5. **Deploy Smart Contract**
   ```bash
   cd blockchain
   npm install
   npx hardhat run scripts/deploy.js --network localhost
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017
   - Ganache: http://localhost:8545

### Option 2: Manual Setup

#### Step 1: Install Prerequisites

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/

2. **MongoDB**
   - Download from: https://www.mongodb.com/try/download/community
   - Start MongoDB: `mongod`

3. **Git**
   - Download from: https://git-scm.com/

4. **MetaMask**
   - Browser extension: https://metamask.io/

#### Step 2: Clone Repository

```bash
git clone <your-repo-url>
cd govfund
```

#### Step 3: Setup Blockchain

```bash
cd blockchain
npm install

# Start local blockchain (keep this running)
npx hardhat node

# In a new terminal, deploy contract
npx hardhat run scripts/deploy.js --network localhost

# Copy the deployed contract address
# Update backend/.env with CONTRACT_ADDRESS
```

#### Step 4: Setup Backend

```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your values:
# - MONGODB_URI
# - JWT_SECRET
# - CONTRACT_ADDRESS (from blockchain deployment)
# - PRIVATE_KEY (from Hardhat node output)

# Start backend server
npm run dev
```

#### Step 5: Setup Frontend

```bash
cd frontend
npm install

# Create environment file
cp .env.example .env

# Edit .env file:
# - REACT_APP_API_URL=http://localhost:5000

# Start frontend
npm start
```

#### Step 6: Configure MetaMask

1. Open MetaMask extension
2. Add Local Network:
   - Network Name: Localhost 8545
   - RPC URL: http://localhost:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

3. Import Account:
   - Copy private key from Hardhat node output
   - Import into MetaMask

## Testing the Application

### 1. Create Test Users

Use the registration page to create users with different roles:

**Admin User:**
```json
{
  "name": "Admin User",
  "email": "admin@govfund.com",
  "password": "admin123",
  "role": "admin"
}
```

**Authority User:**
```json
{
  "name": "Authority User",
  "email": "authority@govfund.com",
  "password": "auth123",
  "role": "authority",
  "organization": "Finance Department"
}
```

**Beneficiary User:**
```json
{
  "name": "Beneficiary User",
  "email": "beneficiary@govfund.com",
  "password": "ben123",
  "role": "beneficiary",
  "walletAddress": "0x..." (from MetaMask)
}
```

### 2. Test Fund Allocation Flow

1. **Login as Authority**
   - Navigate to "Allocate Fund"
   - Fill in project details
   - Select beneficiary
   - Submit allocation

2. **Approve Fund (as different Authority)**
   - Login with another authority account
   - Navigate to "Pending Approvals"
   - Approve the fund

3. **Release Fund**
   - Navigate to "Approved Funds"
   - Click "Release Fund"
   - Enter amount to release
   - Confirm transaction in MetaMask

4. **Track as Beneficiary**
   - Login as beneficiary
   - View received funds
   - Update milestones

### 3. Run Tests

**Smart Contract Tests:**
```bash
cd blockchain
npm test
```

**Backend Tests:**
```bash
cd backend
npm test
```

**Frontend Tests:**
```bash
cd frontend
npm test
```

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in backend/.env
- Verify MongoDB port (default: 27017)

### Issue: "Contract not deployed"
**Solution:**
- Run: `npx hardhat node` (keep running)
- Deploy: `npx hardhat run scripts/deploy.js --network localhost`
- Update CONTRACT_ADDRESS in backend/.env

### Issue: "MetaMask transaction failed"
**Solution:**
- Check you're on the correct network (Localhost 8545)
- Ensure account has sufficient ETH
- Reset MetaMask account (Settings → Advanced → Reset Account)

### Issue: "CORS error"
**Solution:**
- Verify FRONTEND_URL in backend/.env
- Check backend is running on port 5000
- Clear browser cache

## Production Deployment

### Deploy to Ethereum Testnet (Sepolia)

1. **Get Testnet ETH**
   - Sepolia Faucet: https://sepoliafaucet.com/

2. **Update blockchain/.env**
   ```
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   PRIVATE_KEY=your_private_key
   ETHERSCAN_API_KEY=your_etherscan_key
   ```

3. **Deploy Contract**
   ```bash
   cd blockchain
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. **Verify Contract**
   ```bash
   npx hardhat verify --network sepolia CONTRACT_ADDRESS
   ```

### Deploy Backend (Heroku Example)

```bash
cd backend
heroku create govfund-backend
heroku addons:create mongolab
heroku config:set JWT_SECRET=your_secret
heroku config:set CONTRACT_ADDRESS=your_contract
git push heroku main
```

### Deploy Frontend (Vercel Example)

```bash
cd frontend
npm run build
vercel --prod
```

## Maintenance

### Database Backup
```bash
mongodump --db govfund --out ./backup
```

### Update Dependencies
```bash
npm update
npm audit fix
```

### Monitor Logs
```bash
# Backend logs
cd backend
npm run dev

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

## Getting Help

- **Documentation**: See `docs/DOCUMENTATION.md`
- **Issues**: Create an issue on GitHub
- **Email**: your.email@example.com

## Next Steps

1. ✅ Complete setup
2. ✅ Test all features
3. ✅ Deploy to testnet
4. ✅ Conduct security audit
5. ✅ Deploy to production

---

**Congratulations!** Your Government Fund Allocation System is now set up and ready to use.
