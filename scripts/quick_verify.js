/**
 * Quick verification script - uses PRIVATE_KEY from .env
 * Run with: node scripts/quick_verify.js
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const CREATOR_ADDRESS = '0x136Fa7a9F36186d3b94f726028390d17B1774cc8';
const VERIFICATION_REGISTRY_ADDRESS = '0x4D0e845A5099e77E57195A5a9EFb09053D264DAE';
const SONIC_RPC = 'https://rpc.blaze.soniclabs.com';

const VERIFICATION_REGISTRY_ABI = [
    'function verifyCreator(address creator, string provider, uint256 nonce, bytes signature) external',
    'function nonces(address) external view returns (uint256)',
    'function isVerified(address) external view returns (bool)'
];

async function main() {
    console.log('\n🔐 Quick On-Chain Verification');
    console.log('='.repeat(60));

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error('❌ PRIVATE_KEY not found in .env');
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(SONIC_RPC);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Admin Wallet: ${wallet.address}`);
    console.log(`Creator: ${CREATOR_ADDRESS}`);
    console.log(`Registry: ${VERIFICATION_REGISTRY_ADDRESS}\n`);

    const registry = new ethers.Contract(
        VERIFICATION_REGISTRY_ADDRESS,
        VERIFICATION_REGISTRY_ABI,
        wallet
    );

    // Check current status
    console.log('1️⃣  Checking current status...');
    const isCurrentlyVerified = await registry.isVerified(CREATOR_ADDRESS);
    console.log(`   Status: ${isCurrentlyVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED'}\n`);

    if (isCurrentlyVerified) {
        console.log('✅ Already verified! Refresh your Campaign Wizard.');
        return;
    }

    // Get nonce
    console.log('2️⃣  Getting nonce...');
    const nonce = await registry.nonces(CREATOR_ADDRESS);
    console.log(`   Nonce: ${nonce}\n`);

    // Generate signature
    console.log('3️⃣  Generating signature...');
    const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'string', 'uint256'],
        [CREATOR_ADDRESS, 'sumsub', nonce]
    );
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));
    console.log(`   Signature: ${signature.slice(0, 20)}...\n`);

    // Store on-chain
    console.log('4️⃣  Storing verification on-chain...');
    const tx = await registry.verifyCreator(CREATOR_ADDRESS, 'sumsub', nonce, signature);
    console.log(`   Tx sent: ${tx.hash}`);
    console.log(`   Waiting for confirmation...`);

    const receipt = await tx.wait();
    console.log(`   ✅ Confirmed in block ${receipt.blockNumber}\n`);

    // Verify
    console.log('5️⃣  Verifying...');
    const isNowVerified = await registry.isVerified(CREATOR_ADDRESS);
    console.log(`   Status: ${isNowVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED'}\n`);

    console.log('='.repeat(60));
    console.log('🎉 SUCCESS! Creator is now verified on-chain.');
    console.log(`View on explorer: https://blaze.soniclabs.com/tx/${tx.hash}`);
    console.log('='.repeat(60));
    console.log('\n👉 Refresh your Campaign Wizard to see the verified status!\n');
}

main().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
});
