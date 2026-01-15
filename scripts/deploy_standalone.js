import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) throw new Error("No PRIVATE_KEY");

const CM_ABI_PATH = './src_contracts_CampaignManager_sol_CampaignManager.abi';
const CM_BIN_PATH = './src_contracts_CampaignManager_sol_CampaignManager.bin';
const FE_ABI_PATH = './src_contracts_FundEscrow_sol_FundEscrow.abi';
const FE_BIN_PATH = './src_contracts_FundEscrow_sol_FundEscrow.bin';

if (!fs.existsSync(CM_ABI_PATH) || !fs.existsSync(CM_BIN_PATH)) {
    console.error("Artifacts not found. Run solcjs compile first.");
    process.exit(1);
}

const CM_ABI = JSON.parse(fs.readFileSync(CM_ABI_PATH, 'utf8'));
const CM_BIN = '0x' + fs.readFileSync(CM_BIN_PATH, 'utf8');
const FE_ABI = JSON.parse(fs.readFileSync(FE_ABI_PATH, 'utf8'));
const FE_BIN = '0x' + fs.readFileSync(FE_BIN_PATH, 'utf8');

const NETWORKS = [
    {
        name: "Sonic Testnet",
        url: "https://rpc.blaze.soniclabs.com",
        tokens: []
    },
    {
        name: "Sepolia",
        url: "https://1rpc.io/sepolia",
        tokens: [
            "0x94a9D9AC8a22534E3FaCa9f4e7423272C9396996", // USDC
            "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", // USDT
            "0x7b79995e5f793a07bc00c21412e50ecae098e7f9"  // WETH
        ]
    }
];

async function main() {
    const results = {};
    for (const net of NETWORKS) {
        console.log(`\n--- Deploying to ${net.name} ---`);
        try {
            const provider = new ethers.JsonRpcProvider(net.url);
            const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

            const bal = await provider.getBalance(wallet.address);
            console.log(`Balance: ${ethers.formatEther(bal)}`);

            // Deploy Escrow
            console.log("Deploying FundEscrow...");
            const FeFactory = new ethers.ContractFactory(FE_ABI, FE_BIN, wallet);
            const escrow = await FeFactory.deploy();
            await escrow.waitForDeployment();
            const escrowAddr = await escrow.getAddress();
            console.log(`FundEscrow deployed: ${escrowAddr}`);

            // Deploy Manager
            console.log("Deploying CampaignManager...");
            const CmFactory = new ethers.ContractFactory(CM_ABI, CM_BIN, wallet);
            const manager = await CmFactory.deploy(escrowAddr);
            await manager.waitForDeployment();
            const managerAddr = await manager.getAddress();
            console.log(`CampaignManager deployed: ${managerAddr}`);

            // Link
            console.log("Linking Manager to Escrow...");
            // Use FE_ABI for linking
            const escrowContract = new ethers.Contract(escrowAddr, FE_ABI, wallet);
            const tx = await escrowContract.setCampaignManager(managerAddr);
            await tx.wait();
            console.log("Linked.");

            // Whitelist
            if (net.tokens.length > 0) {
                console.log("Whitelisting tokens...");
                const managerContract = new ethers.Contract(managerAddr, CM_ABI, wallet);
                for (const t of net.tokens) {
                    console.log(`Whitelisting ${t}`);
                    try {
                        const txW = await managerContract.whitelistToken(t, true);
                        await txW.wait();
                    } catch (e) {
                        console.error(`Failed to whitelist ${t}: ${e.message}`);
                    }
                }
            }

            results[net.name] = { manager: managerAddr, escrow: escrowAddr };
        } catch (err) {
            console.error(`Deployment to ${net.name} failed:`, err.message);
        }
    }
    console.log("\nFINAL RESULTS:", JSON.stringify(results, null, 2));
}

main().catch(console.error);
