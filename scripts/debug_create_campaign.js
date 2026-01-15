
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const CAMPAIGN_MANAGER_ADDRESS = "0xCE147c6D7823991ecdCB894aD989B567ed589cF3"; // The NEW address
const FUND_ESCROW_ADDRESS = "0x3ecB1c74B1E2c25F696CaC03525e7B254b32FE5f";

const ABI = [
    "function createCampaign(string _title, string _description, string _category, string _image, uint256 _goal, string _currency, uint256 _endDate, tuple(string title, uint256 fundingPercentage, string description, bool released)[] _milestones) external",
    "function verificationRegistry() external view returns (address)"
];

const REGISTRY_ABI = [
    "function isVerified(address _user) external view returns (bool)"
];

const ESCROW_ABI = [
    "function campaignManager() external view returns (address)"
];

async function main() {
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync('debug_output.txt', msg + '\n');
    };

    // Clear previous log
    fs.writeFileSync('debug_output.txt', '');

    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const userAddress = "0x136Fa7a9F36186d3b94f726028390d17B1774cc8";

    log(`Checking interactions for User: ${userAddress}`);
    log(`CampaignManager: ${CAMPAIGN_MANAGER_ADDRESS}`);
    log(`FundEscrow: ${FUND_ESCROW_ADDRESS}`);

    const manager = new ethers.Contract(CAMPAIGN_MANAGER_ADDRESS, ABI, provider);
    const escrow = new ethers.Contract(FUND_ESCROW_ADDRESS, ESCROW_ABI, provider);

    // 1. Verify Escrow Link
    const escrowManager = await escrow.campaignManager();
    log(`\nFundEscrow thinks the Manager is: ${escrowManager}`);
    if (escrowManager.toLowerCase() !== CAMPAIGN_MANAGER_ADDRESS.toLowerCase()) {
        log(`🚨 CRITICAL MISMATCH: Escrow points to ${escrowManager}, but we are using ${CAMPAIGN_MANAGER_ADDRESS}`);
        log("This causes registerCampaign to REVERT because caller is not authorized.");
        return;
    } else {
        log("✅ Escrow Link Verified.");
    }

    // 2. Check Verification
    const registryAddr = await manager.verificationRegistry();
    if (registryAddr !== ethers.ZeroAddress) {
        const registry = new ethers.Contract(registryAddr, REGISTRY_ABI, provider);
        const isVerified = await registry.isVerified(userAddress);
        log(`User Verification Status: ${isVerified ? "✅ VERIFIED" : "❌ NOT VERIFIED"}`);

        if (!isVerified) {
            log("🚨 FAILURE CAUSE: User is not verified!");
            return;
        }
    }

    // 3. Simulate
    const title = "Debug Campaign";
    const description = "Debug Description";
    const category = "Tech";
    const image = "http://test.com/img.png";
    const goal = ethers.parseEther("1");
    const currency = "ETH";
    const endDate = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days
    const milestones = [
        { title: "M1", fundingPercentage: 50, description: "Desc 1", released: false },
        { title: "M2", fundingPercentage: 50, description: "Desc 2", released: false }
    ];

    log("\nSimulating createCampaign transaction...");

    try {
        const txData = manager.interface.encodeFunctionData("createCampaign", [
            title, description, category, image, goal, currency, endDate, milestones
        ]);

        await provider.call({
            to: CAMPAIGN_MANAGER_ADDRESS,
            data: txData,
            from: userAddress
        });

        log("✅ Simulation SUCCESS: Transaction should pass.");

    } catch (error) {
        log("❌ Simulation FAILED:");
        if (error.data) {
            const decoded = manager.interface.parseError(error.data);
            log(`Revert Reason (Decoded): ${decoded ? decoded.name : error.data}`);
            log(`Raw Data: ${error.data}`);

            // Try to decode standard string error
            if (error.data.startsWith('0x08c379a0')) {
                const reason = ethers.AbiCoder.defaultAbiCoder().decode(['string'], '0x' + error.data.slice(10))[0];
                log(`Standard Error Reason: "${reason}"`);
            }
        } else {
            log(error.message);
        }
    }
}

main();
