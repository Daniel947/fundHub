import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = "https://rpc.blaze.soniclabs.com";

async function deploy() {
    if (!PRIVATE_KEY) {
        console.error("Please set PRIVATE_KEY in .env");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("Deploying contracts with account:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("Account balance:", ethers.formatEther(balance), "S");

    const artifactsDir = path.join(__dirname, '../artifacts_custom');

    // 1. Deploy FundEscrow
    console.log("\nDeploying FundEscrow...");
    const fundEscrowArtifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, 'FundEscrow.json'), 'utf8'));
    const FundEscrowFactory = new ethers.ContractFactory(fundEscrowArtifact.abi, fundEscrowArtifact.evm.bytecode.object, wallet);
    const fundEscrow = await FundEscrowFactory.deploy();
    await fundEscrow.waitForDeployment();
    const fundEscrowAddress = await fundEscrow.getAddress();
    console.log("FundEscrow deployed to:", fundEscrowAddress);

    // 2. Deploy CampaignManager
    console.log("\nDeploying CampaignManager...");
    const campaignManagerArtifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, 'CampaignManager.json'), 'utf8'));
    const CampaignManagerFactory = new ethers.ContractFactory(campaignManagerArtifact.abi, campaignManagerArtifact.evm.bytecode.object, wallet);
    const campaignManager = await CampaignManagerFactory.deploy(fundEscrowAddress);
    await campaignManager.waitForDeployment();
    const campaignManagerAddress = await campaignManager.getAddress();
    console.log("CampaignManager deployed to:", campaignManagerAddress);

    // 3. Deploy IdentityRegistry
    console.log("\nDeploying IdentityRegistry...");
    const identityRegistryArtifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, 'IdentityRegistry.json'), 'utf8'));
    const IdentityRegistryFactory = new ethers.ContractFactory(identityRegistryArtifact.abi, identityRegistryArtifact.evm.bytecode.object, wallet);
    const identityRegistry = await IdentityRegistryFactory.deploy();
    await identityRegistry.waitForDeployment();
    const identityRegistryAddress = await identityRegistry.getAddress();
    console.log("IdentityRegistry deployed to:", identityRegistryAddress);

    console.log("\n--- Deployment Summary ---");
    console.log("FundEscrow:", fundEscrowAddress);
    console.log("CampaignManager:", campaignManagerAddress);
    console.log("IdentityRegistry:", identityRegistryAddress);
    console.log("---------------------------\n");

    console.log("Next steps:");
    console.log("2. Update IDENTITY_REGISTRY_ADDRESS in src/lib/abi.ts with:", identityRegistryAddress);

    // Save to JSON for easier automation
    const addresses = {
        CAMPAIGN_MANAGER_ADDRESS: campaignManagerAddress,
        FUND_ESCROW_ADDRESS: fundEscrowAddress,
        IDENTITY_REGISTRY_ADDRESS: identityRegistryAddress
    };
    const addressPath = path.join(__dirname, '../src/lib/deployed_addresses.json');
    fs.writeFileSync(addressPath, JSON.stringify(addresses, null, 2));
    console.log(`\nSaved addresses to ${addressPath}`);
}

deploy().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
