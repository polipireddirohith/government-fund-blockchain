@echo off
echo ===================================================
echo   Government Fund - Streamlit Demo Runner
echo ===================================================

echo 1. Starting MongoDB...
start "MongoDB" cmd /k "mongod"
timeout /t 3

echo 2. Starting Local Blockchain Node...
start "Blockchain Node" cmd /k "cd blockchain && npx hardhat node"
timeout /t 7

echo 3. Deploying Smart Contracts...
cd blockchain
call npx hardhat run scripts/deploy.js --network localhost
cd ..

echo 4. Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3

echo 5. Installing Python Dependencies...
pip install -r streamlit_app/requirements.txt

echo 6. Starting Streamlit App...
start "Streamlit App" cmd /k "cd streamlit_app && streamlit run app.py"

echo ===================================================
echo   Demo is running!
echo   Streamlit App: http://localhost:8501
echo ===================================================
pause
