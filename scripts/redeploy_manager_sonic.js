import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Current addresses on Sonic (from abi.ts)
const EXISTING_FUND_ESCROW = ethers.getAddress("0x47868De05B9898af38FE06fd1611413194dd69c4".toLowerCase());

async function main() {
    const provider = new ethers.JsonRpcProvider('https://rpc.blaze.soniclabs.com');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("Using deployer address:", wallet.address);

    const artifactsDir = path.join(__dirname, '../artifacts_custom');
    const CampaignManagerArtifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, 'CampaignManager.json'), 'utf8'));
    const FundEscrowArtifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, 'FundEscrow.json'), 'utf8'));

    // 1. Deploy NEW CampaignManager
    const VERIFICATION_REGISTRY_SONIC_ADDRESS = "0x3C895d68F9Ef9c1Ed5EB0Ec38649b120f0AA6B3C";
    console.log("Deploying NEW CampaignManager pointing to FundEscrow:", EXISTING_FUND_ESCROW);
    console.log("Using VerificationRegistry:", VERIFICATION_REGISTRY_SONIC_ADDRESS);

    const CampaignManagerFactory = new ethers.ContractFactory(CampaignManagerArtifact.abi, CampaignManagerArtifact.evm.bytecode.object, wallet);
    const campaignManager = await CampaignManagerFactory.deploy(EXISTING_FUND_ESCROW, VERIFICATION_REGISTRY_SONIC_ADDRESS);
    await campaignManager.waitForDeployment();
    const campaignManagerAddress = await campaignManager.getAddress();
    console.log("New CampaignManager deployed to:", campaignManagerAddress);

    // 2. Update FundEscrow to point to the new CampaignManager
    console.log("Updating FundEscrow pointer...");
    const fundEscrow = new ethers.Contract(EXISTING_FUND_ESCROW, FundEscrowArtifact.abi, wallet);
    const tx = await fundEscrow.setCampaignManager(campaignManagerAddress);
    await tx.wait();
    console.log("FundEscrow linked to new manager.");

    // 3. Whitelist tokens in the new manager
    const tokens = [
        '0x29219dd400f2Bf9024c03Aa174503dd2330ca25C', // USDC (Sonic)
        '0x05D8ca2F38f8fD5735163148483Bca750dBC5269', // USDT (Sonic)
        '0x76B509dC175C09F4a10c83a547CeF9e4C8fA4A0A'  // WETH (Sonic)
    ];

    for (let token of tokens) {
        token = ethers.getAddress(token.trim().toLowerCase());
        console.log(`Whitelisting ${token} on new CampaignManager...`);
        const txw = await campaignManager.whitelistToken(token, true);
        await txw.wait();
    }

    console.log("\nRedeployment Successful!");
    console.log("----------------------");
    console.log("NEW CAMPAIGN_MANAGER_ADDRESS (SONIC):", campaignManagerAddress);
}

main().catch(console.error);
