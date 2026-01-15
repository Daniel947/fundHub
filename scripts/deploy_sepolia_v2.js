import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deploy() {
    const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("Deploying from address:", wallet.address);

    const artifactsDir = path.join(__dirname, '../artifacts_custom');
    const FundEscrowArtifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, 'FundEscrow.json'), 'utf8'));
    const CampaignManagerArtifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, 'CampaignManager.json'), 'utf8'));

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
    console.log("Linking CampaignManager in FundEscrow...");
    const tx = await fundEscrow.setCampaignManager(campaignManagerAddress);
    await tx.wait();
    console.log("Linked successfully.");

    // 4. Whitelist tokens
    const tokens = [
        '0x94a9D9AC8a22534E3FaCa9f4e7423272C9396996', // USDC (Sepolia)
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', // USDT (Sepolia)
        '0x7b79995e5f793a07bc00c21412e50ecae098e7f9'  // WETH (Sepolia)
    ];

    for (const token of tokens) {
        console.log(`Whitelisting ${token} on CampaignManager...`);
        const txw = await campaignManager.whitelistToken(token, true);
        await txw.wait();
    }

    console.log("\nDeployment Successful!");
    console.log("----------------------");
    console.log("FUND_ESCROW_SEPOLIA_ADDRESS:", fundEscrowAddress);
    console.log("CAMPAIGN_MANAGER_SEPOLIA_ADDRESS:", campaignManagerAddress);
}

deploy().catch(console.error);
