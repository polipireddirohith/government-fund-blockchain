const hre = require("hardhat");

async function main() {
    console.log("Deploying FundAllocation contract...");

    const FundAllocation = await hre.ethers.getContractFactory("FundAllocation");
    const fundAllocation = await FundAllocation.deploy();

    await fundAllocation.deployed();

    console.log(`\n✅ FundAllocation contract deployed to: ${fundAllocation.address}`);
    console.log(`\nSave this address to your backend .env file:`);
    console.log(`CONTRACT_ADDRESS=${fundAllocation.address}`);

    // Grant roles
    const [deployer, authority1, authority2, auditor] = await hre.ethers.getSigners();

    console.log("\n📝 Account addresses:");
    console.log("Deployer:", deployer.address);
    console.log("Authority 1:", authority1.address);
    console.log("Authority 2:", authority2.address);
    console.log("Auditor:", auditor.address);

    const AUTHORITY_ROLE = await fundAllocation.AUTHORITY_ROLE();
    const AUDITOR_ROLE = await fundAllocation.AUDITOR_ROLE();

    console.log("\n🔐 Granting roles...");
    await fundAllocation.grantRole(AUTHORITY_ROLE, authority1.address);
    await fundAllocation.grantRole(AUTHORITY_ROLE, authority2.address);
    await fundAllocation.grantRole(AUDITOR_ROLE, auditor.address);

    console.log("✓ Roles granted successfully!");
    console.log("\n🎉 Deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
