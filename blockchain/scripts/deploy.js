const hre = require("hardhat");

async function main() {
    console.log("Deploying FundAllocation contract...");

    // Get the contract factory
    const FundAllocation = await hre.ethers.getContractFactory("FundAllocation");

    // Deploy the contract
    const fundAllocation = await FundAllocation.deploy();

    await fundAllocation.waitForDeployment();

    const contractAddress = await fundAllocation.getAddress();

    console.log(`FundAllocation contract deployed to: ${contractAddress}`);

    // Grant roles to additional accounts if needed
    const [deployer, authority1, authority2, auditor] = await hre.ethers.getSigners();

    console.log("\nDeployer address:", deployer.address);
    console.log("Authority 1 address:", authority1.address);
    console.log("Authority 2 address:", authority2.address);
    console.log("Auditor address:", auditor.address);

    // Grant roles
    const AUTHORITY_ROLE = await fundAllocation.AUTHORITY_ROLE();
    const AUDITOR_ROLE = await fundAllocation.AUDITOR_ROLE();

    console.log("\nGranting roles...");

    await fundAllocation.grantRole(AUTHORITY_ROLE, authority1.address);
    console.log("✓ Granted AUTHORITY_ROLE to", authority1.address);

    await fundAllocation.grantRole(AUTHORITY_ROLE, authority2.address);
    console.log("✓ Granted AUTHORITY_ROLE to", authority2.address);

    await fundAllocation.grantRole(AUDITOR_ROLE, auditor.address);
    console.log("✓ Granted AUDITOR_ROLE to", auditor.address);

    console.log("\n✅ Deployment completed successfully!");
    console.log("\nContract Address:", contractAddress);
    console.log("\nSave this address to your .env file:");
    console.log(`CONTRACT_ADDRESS=${contractAddress}`);

    // Verify contract on Etherscan (if not on localhost)
    if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
        console.log("\nWaiting for block confirmations...");
        await fundAllocation.deploymentTransaction().wait(6);

        console.log("Verifying contract on Etherscan...");
        try {
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [],
            });
            console.log("✓ Contract verified on Etherscan");
        } catch (error) {
            console.log("Error verifying contract:", error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
