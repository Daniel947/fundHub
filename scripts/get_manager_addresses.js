import { ethers } from 'ethers';

const SONIC_RPC = 'https://rpc.blaze.soniclabs.com';
const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

const SONIC_ESCROW = "0x47868De05B9898af38FE06fd1611413194dd69c4";
const SEPOLIA_ESCROW = "0x3ecB1c74B1E2c25F696CaC03525e7B254b32FE5f";

const ESCROW_ABI = [
    "function campaignManager() external view returns (address)"
];

import fs from 'fs';

async function main() {

    // Check Sonic (Retry)
    try {
        const sonicProvider = new ethers.JsonRpcProvider(SONIC_RPC);
        const sonicEscrow = new ethers.Contract(SONIC_ESCROW, ESCROW_ABI, sonicProvider);
        const sonicAddr = await sonicEscrow.campaignManager();

        // Read existing
        let current = {};
        try { current = JSON.parse(fs.readFileSync('addresses.json', 'utf8')); } catch (e) { }

        current.SONIC_CAMPAIGN_MANAGER = sonicAddr;
        fs.writeFileSync('addresses.json', JSON.stringify(current, null, 2));

    } catch (e) {
        console.error("Sonic Error:", e.message);
    }
}

main();
