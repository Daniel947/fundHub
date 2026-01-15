// SPDX-License-Identifier: MIT
// Script to deploy VerificationRegistry contract
// Run with: node scripts/deploy_verification_registry.js

import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const APP_NETWORK = (process.env.APP_NETWORK || 'testnet').toLowerCase();

// Admin wallet that will sign verification messages
// This should be a secure, dedicated wallet for verification signing
const VERIFICATION_ADMIN_ADDRESS = process.env.VERIFICATION_ADMIN_ADDRESS || process.env.PRIVATE_KEY;

// Network configurations
const SONIC_RPC = APP_NETWORK === 'mainnet' ? 'https://rpc.soniclabs.com' : 'https://rpc.blaze.soniclabs.com';
const ETH_RPC = APP_NETWORK === 'mainnet' ? 'https://1rpc.io/eth' : 'https://1rpc.io/sepolia';

// VerificationRegistry bytecode (compile first with: npx hardhat compile or forge build)
// This is a placeholder - you'll need to compile the contract first
const VERIFICATION_REGISTRY_ABI = [
    "constructor(address _admin)",
    "function isVerified(address) external view returns (bool)",
    "function verifyCreator(address creator, string provider, uint256 nonce, bytes signature) external",
    "function admin() external view returns (address)"
];

async function deployToNetwork(networkName, rpcUrl) {
    console.log(`\n🚀 Deploying VerificationRegistry to ${networkName}...`);

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`Deployer address: ${wallet.address}`);
    console.log(`Admin address: ${VERIFICATION_ADMIN_ADDRESS}`);

    // Get the contract factory
    // NOTE: You need to compile the contract first and import the artifacts
    // For now, this is a template - you'll need to add the actual bytecode

    console.log('\n⚠️  IMPORTANT: Compile the contract first with:');
    console.log('   npx hardhat compile');
    console.log('   or');
    console.log('   forge build');
    console.log('\nThen import the bytecode and deploy.');

    // Example deployment (uncomment after compiling):
    /*
    const VerificationRegistry = new ethers.ContractFactory(
        VERIFICATION_REGISTRY_ABI,
        VERIFICATION_REGISTRY_BYTECODE,
        wallet
    );
    
    const registry = await VerificationRegistry.deploy(VERIFICATION_ADMIN_ADDRESS);
    await registry.waitForDeployment();
    
    const address = await registry.getAddress();
    console.log(`✅ VerificationRegistry deployed to: ${address}`);
    console.log(`   Admin: ${await registry.admin()}`);
    
    return address;
    */
}

async function main() {
    console.log('='.repeat(60));
    console.log('KRNL VerificationRegistry Deployment');
    console.log('='.repeat(60));

    try {
        // Deploy to Sonic
        const sonicAddress = await deployToNetwork('Sonic Blaze', SONIC_RPC);

        // Deploy to Sepolia (optional)
        // const sepoliaAddress = await deployToNetwork('Sepolia', ETH_RPC);

        console.log('\n' + '='.repeat(60));
        console.log('📝 Update your .env file with:');
        console.log('='.repeat(60));
        console.log(`VERIFICATION_REGISTRY_SONIC_ADDRESS=${sonicAddress || 'PENDING'}`);
        // console.log(`VERIFICATION_REGISTRY_ADDRESS=${sepoliaAddress || 'PENDING'}`);
        console.log(`VERIFICATION_ADMIN_KEY=${PRIVATE_KEY}`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

main();
