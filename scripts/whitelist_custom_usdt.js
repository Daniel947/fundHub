import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

    // Contract Addresses
    const CAMPAIGN_MANAGER_ADDRESS = "0x45Fe5e5892932B4758Dd4D6Bee0233482fb2CE4F".toLowerCase();
    const CUSTOM_USDT_ADDRESS = "0x8fE57961BE13EBDd2ED04ef57fC232f3532C88dB".toLowerCase();

    if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not found");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("Whitelisting USDT using wallet:", wallet.address);

    const managerArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts_custom/CampaignManager.json'), 'utf8'));
    const manager = new ethers.Contract(CAMPAIGN_MANAGER_ADDRESS, managerArtifact.abi, wallet);

    console.log("Calling whitelistToken...");
    const tx = await manager.whitelistToken(CUSTOM_USDT_ADDRESS, true);
    console.log("Transaction hash:", tx.hash);

    await tx.wait();
    console.log("USDT whitelisted successfully!");
}

main().catch(console.error);
