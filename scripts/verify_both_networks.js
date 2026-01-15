/**
 * Verify creator on both Sonic and Sepolia
 * Run with: node scripts/verify_both_networks.js
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const CREATOR_ADDRESS = '0x136Fa7a9F36186d3b94f726028390d17B1774cc8';
const SONIC_REGISTRY = '0x3C895d68F9Ef9c1Ed5EB0Ec38649b120f0AA6B3C';
const SEPOLIA_REGISTRY = '0xe16091639b41fD74fEd513Dfde226D8edc63eeE0';
const SONIC_RPC = 'https://rpc.blaze.soniclabs.com';
const SEPOLIA_RPC = 'https://1rpc.io/sepolia';

const VERIFICATION_REGISTRY_ABI = [
    'function verifyCreator(address creator, string provider, uint256 nonce, bytes signature) external',
    'function nonces(address) external view returns (uint256)',
    'function isVerified(address) external view returns (bool)'
];

async function verifyOnNetwork(networkName, rpcUrl, registryAddress) {
    console.log(`\n🔐 Verifying on ${networkName}`);
    console.log('='.repeat(60));

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('PRIVATE_KEY not found in .env');
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Admin: ${wallet.address}`);
    console.log(`Creator: ${CREATOR_ADDRESS}`);
    console.log(`Registry: ${registryAddress}\n`);

    const registry = new ethers.Contract(registryAddress, VERIFICATION_REGISTRY_ABI, wallet);

    // Check current status
    console.log('1️⃣  Checking current status...');
    const isCurrentlyVerified = await registry.isVerified(CREATOR_ADDRESS);
    console.log(`   Status: ${isCurrentlyVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED'}\n`);

    if (isCurrentlyVerified) {
        console.log('✅ Already verified on this network!');
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
    console.log(`   Tx: ${tx.hash}`);
    console.log(`   Waiting for confirmation...`);

    const receipt = await tx.wait();
    console.log(`   ✅ Confirmed in block ${receipt.blockNumber}\n`);

    // Verify
    console.log('5️⃣  Verifying...');
    const isNowVerified = await registry.isVerified(CREATOR_ADDRESS);
    console.log(`   Status: ${isNowVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED'}\n`);

    console.log('='.repeat(60));
}

async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('Multi-Network Creator Verification');
    console.log('='.repeat(60));

    try {
        // Verify on Sonic
        await verifyOnNetwork('Sonic Blaze', SONIC_RPC, SONIC_REGISTRY);

        // Verify on Sepolia
        await verifyOnNetwork('Sepolia', SEPOLIA_RPC, SEPOLIA_REGISTRY);

        console.log('\n' + '='.repeat(60));
        console.log('🎉 SUCCESS! Creator verified on both networks!');
        console.log('='.repeat(60));
        console.log(`Sonic:   https://blaze.soniclabs.com/address/${SONIC_REGISTRY}`);
        console.log(`Sepolia: https://sepolia.etherscan.io/address/${SEPOLIA_REGISTRY}`);
        console.log('='.repeat(60));
        console.log('\n✅ You can now create campaigns on both networks!');
        console.log('   Refresh your Campaign Wizard to see verified status.\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

main();
