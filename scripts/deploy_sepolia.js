const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy FundEscrow
    console.log("Deploying FundEscrow...");
    const FundEscrow = await hre.ethers.getContractFactory("FundEscrow");
    const fundEscrow = await FundEscrow.deploy();
    await fundEscrow.waitForDeployment();
    const fundEscrowAddress = await fundEscrow.getAddress();
    console.log("FundEscrow deployed to:", fundEscrowAddress);

    // 2. Deploy CampaignManager
    console.log("Deploying CampaignManager...");
    const CampaignManager = await hre.ethers.getContractFactory("CampaignManager");
    const campaignManager = await CampaignManager.deploy(fundEscrowAddress);
    await campaignManager.waitForDeployment();
    const campaignManagerAddress = await campaignManager.getAddress();
    console.log("CampaignManager deployed to:", campaignManagerAddress);

    // 3. Link them
    console.log("Setting CampaignManager in FundEscrow...");
    const setTx = await fundEscrow.setCampaignManager(campaignManagerAddress);
    await setTx.wait();
    console.log("Linked successfully.");

    // 4. Whitelist tokens on Sepolia (OFFICIAL ADDRESSES)
    const tokens = [
        "0x1c7D4B196Cb0C7B01D743Fbc6116a902379C7238", // Circle USDC (Sepolia)
        "0x7169D388157f50827137f8DBeBa916E75796E2E8", // Aave USDT (Sepolia)
        "0x7b79995e5f793a07bc00c21412e50ecae098e7f9"  // WETH (Sepolia)
    ];

    console.log("Waiting for network sync (5s)...");
    await new Promise(r => setTimeout(r, 5000));

    for (const token of tokens) {
        console.log(`Whitelisting ${token}...`);
        try {
            const tx = await campaignManager.whitelistToken(token, true);
            await tx.wait();
            console.log(`  Done: ${token}`);
        } catch (e) {
            console.error(`  Failed to whitelist ${token}:`, e.message);
        }
    }

    console.log("\nDeployment Complete!");
    console.log("-------------------");
    console.log("FUND_ESCROW_SEPOLIA_ADDRESS:", fundEscrowAddress);
    console.log("CAMPAIGN_MANAGER_SEPOLIA_ADDRESS:", campaignManagerAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
