import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const provider = new ethers.JsonRpcProvider('https://rpc.blaze.soniclabs.com');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const fundEscrowAddress = "0xCDdDc7878bDB1F3b79430eA5FB4cB096f5D3c3c5";
    const campaignManagerAddress = "0x5608cc55089B33e934782f474eBB427969608937";

    const artifactsDir = path.join(__dirname, '../artifacts_custom');
    const FundEscrowArtifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, 'FundEscrow.json'), 'utf8'));
    const CampaignManagerArtifact = JSON.parse(fs.readFileSync(path.join(artifactsDir, 'CampaignManager.json'), 'utf8'));

    const fundEscrow = new ethers.Contract(fundEscrowAddress, FundEscrowArtifact.abi, wallet);
    const campaignManager = new ethers.Contract(campaignManagerAddress, CampaignManagerArtifact.abi, wallet);

    console.log("Setting CampaignManager on FundEscrow...");
    const tx1 = await fundEscrow.setCampaignManager(campaignManagerAddress);
    await tx1.wait();
    console.log("Linked successfully.");

    const tokens = [
        ethers.getAddress('0x29219dd400f2Bf9024c03Aa174503dd2330ca25C'.toLowerCase()), // USDC (Sonic)
        ethers.getAddress('0x05D8ca2F38f8fD5735163148483Bca750dBC5269'.toLowerCase()), // USDT (Sonic)
        ethers.getAddress('0x76B509dC175C09F4a10c83a547CeF9e4C8fA4A0A'.toLowerCase())  // WETH (Sonic)
    ];

    console.log("Whitelisting tokens on Sonic CampaignManager...");
    for (const token of tokens) {
        console.log(`Whitelisting ${token}...`);
        const tx = await campaignManager.whitelistToken(token, true);
        await tx.wait();
        console.log(`Whitelisted ${token}`);
    }

    console.log("Sonic configuration complete!");
}

main().catch(console.error);
