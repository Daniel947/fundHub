const hre = require("hardhat");

async function main() {
    console.log("Starting deployment on:", hre.network.name);

    // 1. Deploy FundEscrow
    const FundEscrow = await hre.ethers.getContractFactory("FundEscrow");
    const fundEscrow = await FundEscrow.deploy();
    await fundEscrow.waitForDeployment();
    const fundEscrowAddress = await fundEscrow.getAddress();
    console.log("FundEscrow deployed to:", fundEscrowAddress);

    // 2. Deploy CampaignManager
    const CampaignManager = await hre.ethers.getContractFactory("CampaignManager");
    const campaignManager = await CampaignManager.deploy(fundEscrowAddress);
    await campaignManager.waitForDeployment();
    const campaignManagerAddress = await campaignManager.getAddress();
    console.log("CampaignManager deployed to:", campaignManagerAddress);

    // 3. Optional: Initial setup (e.g. whitelist a token if needed)
    // For testing, we might want the escrow to allow a specific token or the native one if applicable.
    // Note: FundEscrow.sol uses 'IERC20(token).safeTransferFrom', so it expects ERC20 tokens.

    console.log("\n--- Deployment Summary ---");
    console.log("FundEscrow:", fundEscrowAddress);
    console.log("CampaignManager:", campaignManagerAddress);
    console.log("---------------------------\n");

    console.log("Deployment complete! Please update CAMPAIGN_MANAGER_ADDRESS in src/lib/abi.ts");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
