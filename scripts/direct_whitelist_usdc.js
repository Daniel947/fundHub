import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
    const FUND_ESCROW_ADDR = "0x31e9b3c2f1605a93a67dd35155c231489aadfa70";
    const USDT_SEPOLIA = "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0";

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("Using wallet:", wallet.address);

    const abi = [
        "function whitelistToken(address token, bool status) external",
        "function whitelistedTokens(address) view returns (bool)"
    ];

    const escrow = new ethers.Contract(FUND_ESCROW_ADDR, abi, wallet);

    console.log("Whitelisting USDC directly on FundEscrow...");
    try {
        const tx = await escrow.whitelistToken(USDC_SEPOLIA, true);
        console.log("Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        const isWhitelisted = await escrow.whitelistedTokens(USDC_SEPOLIA);
        console.log(`USDC Whitelisted now?: ${isWhitelisted}`);

        if (!isWhitelisted) {
            console.error("CRITICAL: State did not update after successful transaction!");
        }
    } catch (error) {
        console.error("Failed to whitelist USDC:", error.message);
    }
}

main().catch(console.error);
