import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
    const CAMPAIGN_MANAGER_ADDR = "0x2E1926Bc75C9afc43b71A2DCB4403dD01872501D";
    const USDC_SEPOLIA = "0x94a9D9AC8a22534E3FaCa9f4e7423272C9396996";
    const USDT_SEPOLIA = "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0";

    if (!PRIVATE_KEY) {
        console.error("PRIVATE_KEY not found in .env");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("Using wallet:", wallet.address);

    const abi = [
        "function whitelistToken(address token, bool status) external"
    ];

    const campaignManager = new ethers.Contract(CAMPAIGN_MANAGER_ADDR, abi, wallet);

    console.log("Whitelisting USDC on Sepolia...");
    try {
        const tx = await campaignManager.whitelistToken(USDC_SEPOLIA, true);
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("USDC successfully whitelisted!");
    } catch (error) {
        console.error("Failed to whitelist USDC:", error.message);
    }

    console.log("Whitelisting USDT on Sepolia...");
    try {
        const tx = await campaignManager.whitelistToken(USDT_SEPOLIA, true);
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("USDT successfully whitelisted!");
    } catch (error) {
        console.error("Failed to whitelist USDT:", error.message);
    }
}

main().catch(console.error);
