/**
 * Check verification status on-chain
 * Run with: node scripts/check_verification.js
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const CREATOR_ADDRESS = '0x136Fa7a9F36186d3b94f726028390d17B1774cc8';
const VERIFICATION_REGISTRY_ADDRESS = '0x4D0e845A5099e77E57195A5a9EFb09053D264DAE';
const SONIC_RPC = 'https://rpc.blaze.soniclabs.com';

const VERIFICATION_REGISTRY_ABI = [
    'function isVerified(address) external view returns (bool)',
    'function verifiedAt(address) external view returns (uint256)',
    'function verificationProvider(address) external view returns (string)'
];

async function main() {
    console.log('\n🔍 Checking Verification Status');
    console.log('='.repeat(60));

    const provider = new ethers.JsonRpcProvider(SONIC_RPC);
    const registry = new ethers.Contract(
        VERIFICATION_REGISTRY_ADDRESS,
        VERIFICATION_REGISTRY_ABI,
        provider
    );

    console.log(`Creator: ${CREATOR_ADDRESS}`);
    console.log(`Registry: ${VERIFICATION_REGISTRY_ADDRESS}\n`);

    const isVerified = await registry.isVerified(CREATOR_ADDRESS);
    console.log(`✅ Is Verified: ${isVerified}`);

    if (isVerified) {
        const verifiedAt = await registry.verifiedAt(CREATOR_ADDRESS);
        const provider_name = await registry.verificationProvider(CREATOR_ADDRESS);

        const date = new Date(Number(verifiedAt) * 1000);
        console.log(`📅 Verified At: ${date.toLocaleString()}`);
        console.log(`🏢 Provider: ${provider_name}`);
    }

    console.log('='.repeat(60) + '\n');
}

main().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
});
