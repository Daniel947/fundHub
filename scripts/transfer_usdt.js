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

    // Deployment address
    const CUSTOM_USDT_ADDRESS = "0x8fE57961BE13EBDd2ED04ef57fC232f3532C88dB";
    const USER_ADDRESS = "0x136Fa7a9F36186d3b94f726028390d17B1774cc8";

    if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not found");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("Transferring USDT from:", wallet.address, "to:", USER_ADDRESS);

    const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts_custom/TetherToken.json'), 'utf8'));
    const usdt = new ethers.Contract(CUSTOM_USDT_ADDRESS, artifact.abi, wallet);

    // Send 1,000,000,000 USDT
    const amount = ethers.parseUnits("1000000000", 6);

    console.log("Calling transfer...");
    const tx = await usdt.transfer(USER_ADDRESS, amount);
    console.log("Transaction hash:", tx.hash);

    await tx.wait();
    console.log("USDT transferred successfully!");
}

main().catch(console.error);
