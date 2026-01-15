import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function main() {
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("Deploying with wallet:", wallet.address);

    const FundEscrowArtifact = JSON.parse(fs.readFileSync('artifacts_custom/FundEscrow.json', 'utf8'));
    const CampaignManagerArtifact = JSON.parse(fs.readFileSync('artifacts_custom/CampaignManager.json', 'utf8'));

    // 1. Deploy FundEscrow
    console.log("Deploying FundEscrow...");
    const FundEscrowFactory = new ethers.ContractFactory(FundEscrowArtifact.abi, FundEscrowArtifact.evm.bytecode.object, wallet);
    const fundEscrow = await FundEscrowFactory.deploy();
    await fundEscrow.waitForDeployment();
    const fundEscrowAddress = await fundEscrow.getAddress();
    console.log("FundEscrow deployed to:", fundEscrowAddress);

    // 2. Deploy CampaignManager
    console.log("Deploying CampaignManager...");
    const CampaignManagerFactory = new ethers.ContractFactory(CampaignManagerArtifact.abi, CampaignManagerArtifact.evm.bytecode.object, wallet);
    const campaignManager = await CampaignManagerFactory.deploy(fundEscrowAddress);
    await campaignManager.waitForDeployment();
    const campaignManagerAddress = await campaignManager.getAddress();
    console.log("CampaignManager deployed to:", campaignManagerAddress);

    // 3. Link them
    console.log("Linking contracts...");
    const linkTx = await fundEscrow.setCampaignManager(campaignManagerAddress);
    await linkTx.wait();
    console.log("Linked successfully.");

    // Write to a file for safe reading IMMEDIATELY after deployment/link
    const output = `FUND_ESCROW_SEPOLIA_ADDRESS: ${fundEscrowAddress}\nCAMPAIGN_MANAGER_SEPOLIA_ADDRESS: ${campaignManagerAddress}`;
    fs.writeFileSync('new_deployment_output.txt', output);
    console.log("Addresses saved to new_deployment_output.txt");

    // 4. Whitelist tokens (LOWERCASE to avoid checksum issues)
    const tokens = [
        "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238", // Circle USDC
        "0x7169d388157f50827137f8dbeba916e75796e2e8", // Aave USDT
        "0x7b79995e5f793a07bc00c21412e50ecae098e7f9"  // WETH
    ];

    for (const token of tokens) {
        console.log(`Whitelisting ${token}...`);
        const tx = await campaignManager.whitelistToken(token, true);
        await tx.wait();
        console.log(`  Done: ${token}`);
    }

    console.log("\nDeployment Complete!");
    console.log("FUND_ESCROW_SEPOLIA_ADDRESS:", fundEscrowAddress);
    console.log("CAMPAIGN_MANAGER_SEPOLIA_ADDRESS:", campaignManagerAddress);

    console.log("\nDeployment Complete!");
    console.log("FUND_ESCROW_SEPOLIA_ADDRESS:", fundEscrowAddress);
    console.log("CAMPAIGN_MANAGER_SEPOLIA_ADDRESS:", campaignManagerAddress);
}

main().catch(console.error);
