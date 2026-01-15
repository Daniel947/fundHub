/**
 * Check verification status on Sepolia
 * Run with: node scripts/check_verification_sepolia.js
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const CREATOR_ADDRESS = '0x136Fa7a9F36186d3b94f726028390d17B1774cc8';
const VERIFICATION_REGISTRY_ADDRESS = '0x4D0e845A5099e77E57195A5a9EFb09053D264DAE'; // This is Sonic address
const SEPOLIA_RPC = 'https://1rpc.io/sepolia';

const VERIFICATION_REGISTRY_ABI = [
    'function isVerified(address) external view returns (bool)',
    'function verifiedAt(address) external view returns (uint256)',
    'function verificationProvider(address) external view returns (string)'
];

async function main() {
    console.log('\n🔍 Checking Verification Status on Sepolia');
    console.log('='.repeat(60));

    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);

    console.log(`Creator: ${CREATOR_ADDRESS}`);
    console.log(`Registry: ${VERIFICATION_REGISTRY_ADDRESS}`);
    console.log(`Network: Sepolia\n`);

    try {
        // Check if contract exists at this address
        const code = await provider.getCode(VERIFICATION_REGISTRY_ADDRESS);

        if (code === '0x') {
            console.log('❌ VerificationRegistry NOT deployed on Sepolia!');
            console.log('\nThis is the issue:');
            console.log('- VerificationRegistry is only deployed on Sonic (0x4D0e845A5099e77E57195A5a9EFb09053D264DAE)');
            console.log('- You need to deploy it to Sepolia as well');
            console.log('- OR remove the verification check from Sepolia CampaignManager');
            console.log('\nRecommendation: Deploy VerificationRegistry to Sepolia');
            return;
        }

        const registry = new ethers.Contract(
            VERIFICATION_REGISTRY_ADDRESS,
            VERIFICATION_REGISTRY_ABI,
            provider
        );

        const isVerified = await registry.isVerified(CREATOR_ADDRESS);
        console.log(`✅ Is Verified: ${isVerified}`);

        if (isVerified) {
            const verifiedAt = await registry.verifiedAt(CREATOR_ADDRESS);
            const provider_name = await registry.verificationProvider(CREATOR_ADDRESS);

            const date = new Date(Number(verifiedAt) * 1000);
            console.log(`📅 Verified At: ${date.toLocaleString()}`);
            console.log(`🏢 Provider: ${provider_name}`);
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }

    console.log('='.repeat(60) + '\n');
}

main();
