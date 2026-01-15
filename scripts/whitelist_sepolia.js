const hre = require("hardhat");

async function main() {
    const CAMPAIGN_MANAGER_ADDR = "0x2E1926Bc75C9afc43b71A2DCB4403dD01872501D";
    const tokens = [
        "0x94a9D9AC8a22534E3FaCa9f4e7423272C9396996", // USDC (Sepolia)
        "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", // USDT (Sepolia)
        "0x7b79995e5f793a07bc00c21412e50ecae098e7f9"  // WETH (Sepolia)
    ];

    console.log("Using CampaignManager at:", CAMPAIGN_MANAGER_ADDR);
    const campaignManager = await hre.ethers.getContractAt("CampaignManager", CAMPAIGN_MANAGER_ADDR);

    for (const token of tokens) {
        console.log(`Whitelisting token: ${token}...`);
        try {
            const tx = await campaignManager.whitelistToken(token, true);
            console.log(`Transaction hash: ${tx.hash}`);
            await tx.wait();
            console.log(`Token ${token} whitelisted successfully.`);
        } catch (err) {
            console.error(`Failed to whitelist ${token}:`, err.message);
        }
    }

    console.log("Whitelisting process complete.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
