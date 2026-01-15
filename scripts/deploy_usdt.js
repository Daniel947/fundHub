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
    const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com"; // Verified reliable node

    if (!PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY not found in .env");
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log("Deploying USDT with wallet:", wallet.address);

    const artifactPath = path.join(__dirname, '../artifacts_custom/TetherToken.json');
    if (!fs.existsSync(artifactPath)) {
        throw new Error("Artifacts not found. Run scripts/compile_usdt.js first.");
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const abi = artifact.abi;
    const bytecode = artifact.evm.bytecode.object;

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    // Initial supply: 10B tokens with 6 decimals
    const initialSupply = ethers.parseUnits("10000000000", 6);
    const name = "Tether USD";
    const symbol = "USDT";
    const decimals = 6;

    console.log("Deploying TetherToken...");
    const contract = await factory.deploy(initialSupply, name, symbol, decimals);
    await contract.waitForDeployment();

    const deployedAddress = await contract.getAddress();
    console.log("USDT deployed to:", deployedAddress);

    // Save the address
    const output = {
        usdt_address: deployedAddress,
        network: "sepolia",
        timestamp: new Date().toISOString()
    };
    fs.writeFileSync(path.join(__dirname, '../usdt_deployment.json'), JSON.stringify(output, null, 2));

    console.log("Deployment info saved to usdt_deployment.json");
}

main().catch(console.error);
