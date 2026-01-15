import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Current addresses on Sepolia
const EXISTING_FUND_ESCROW = ethers.getAddress("0x3ecB1c74B1E2c25F696CaC03525e7B254b32FE5f".toLowerCase());

async function main() {
    const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("Using deployer address:", wallet.address);

    const artifactsDir = path.join(__dirname, '../artifacts_custom');
    const CampaignManagerArtifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, 'CampaignManager.json'), 'utf8'));
    const FundEscrowArtifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, 'FundEscrow.json'), 'utf8'));

    // 1. Deploy NEW CampaignManager
    const VERIFICATION_REGISTRY_SEPOLIA_ADDRESS = "0xe16091639b41fD74fEd513Dfde226D8edc63eeE0";
    console.log("Deploying NEW CampaignManager pointing to FundEscrow:", EXISTING_FUND_ESCROW);
    console.log("Using VerificationRegistry:", VERIFICATION_REGISTRY_SEPOLIA_ADDRESS);

    const CampaignManagerFactory = new ethers.ContractFactory(CampaignManagerArtifact.abi, CampaignManagerArtifact.evm.bytecode.object, wallet);
    const campaignManager = await CampaignManagerFactory.deploy(EXISTING_FUND_ESCROW, VERIFICATION_REGISTRY_SEPOLIA_ADDRESS);
    await campaignManager.waitForDeployment();
    const campaignManagerAddress = await campaignManager.getAddress();
    console.log("New CampaignManager deployed to:", campaignManagerAddress);

    // 2. Update FundEscrow to point to the new CampaignManager
    console.log("Updating FundEscrow pointer...");
    const fundEscrow = new ethers.Contract(EXISTING_FUND_ESCROW, FundEscrowArtifact.abi, wallet);
    const tx = await fundEscrow.setCampaignManager(campaignManagerAddress);
    await tx.wait();
    console.log("FundEscrow linked to new manager.");

    const tokens = [
        '0x94a9D9AC8a22534E3FaCa9f4e7423272C9396996', // USDC (Sepolia)
        '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', // USDT (Sepolia)
        '0x7b79995e5f793a07bc00c21412e50ecae098e7f9'  // WETH (Sepolia)
    ];

    for (let token of tokens) {
        token = ethers.getAddress(token.trim().toLowerCase());
        console.log(`Checking token: [${token}] length: ${token.length}`);

        console.log(`Whitelisting ${token} on new CampaignManager...`);
        try {
            const txw = await campaignManager.whitelistToken(token, true);
            await txw.wait();
            console.log(`Successfully whitelisted ${token}`);
        } catch (err) {
            console.error(`Failed to whitelist ${token}:`);
            console.error(err);
            throw err;
        }
    }

    console.log("\nRedeployment Successful!");
    console.log("----------------------");
    console.log("NEW CAMPAIGN_MANAGER_SEPOLIA_ADDRESS:", campaignManagerAddress);
}

main().catch((err) => {
    console.error("Redeployment failed:");
    console.error(err);
    process.exit(1);
});
