/**
 * @module krnl
 * @description KRNL signature generation for on-chain verification
 * 
 * This module provides cryptographic signature generation for storing
 * KYC verification status on-chain via the VerificationRegistry contract.
 * 
 * Flow:
 * 1. Sumsub webhook triggers after KYC approval
 * 2. Backend generates signature using admin private key
 * 3. Backend calls VerificationRegistry.verifyCreator() with signature
 * 4. Contract verifies signature and stores verification on-chain
 */

import { ethers } from 'ethers';

// Environment variables
const VERIFICATION_ADMIN_KEY = process.env.VERIFICATION_ADMIN_KEY;
const VERIFICATION_REGISTRY_ADDRESS = process.env.VERIFICATION_REGISTRY_ADDRESS;
const VERIFICATION_REGISTRY_SONIC_ADDRESS = process.env.VERIFICATION_REGISTRY_SONIC_ADDRESS;

// VerificationRegistry ABI (minimal interface)
const VERIFICATION_REGISTRY_ABI = [
    'function verifyCreator(address creator, string provider, uint256 nonce, bytes signature) external',
    'function nonces(address) external view returns (uint256)',
    'function isVerified(address) external view returns (bool)'
];

/**
 * Generate a signature for on-chain verification
 * @param {string} creatorAddress - The wallet address to verify
 * @param {string} provider - Verification provider (e.g., "sumsub")
 * @param {number} nonce - Current nonce for the creator
 * @returns {Promise<string>} The signature
 */
export async function generateVerificationSignature(creatorAddress, provider, nonce) {
    if (!VERIFICATION_ADMIN_KEY) {
        throw new Error('VERIFICATION_ADMIN_KEY not configured');
    }

    const wallet = new ethers.Wallet(VERIFICATION_ADMIN_KEY);

    // Create the message hash (matches contract's expected format)
    const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'string', 'uint256'],
        [creatorAddress, provider, nonce]
    );

    // Sign the message (adds Ethereum prefix automatically)
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));

    console.log(`[KRNL] Generated signature for ${creatorAddress} (nonce: ${nonce})`);
    return signature;
}

/**
 * Store verification on-chain via VerificationRegistry
 * @param {string} creatorAddress - The wallet address to verify
 * @param {string} provider - Verification provider (e.g., "sumsub")
 * @param {string} network - Network to use ('sepolia' or 'sonic')
 * @returns {Promise<string>} Transaction hash
 */
export async function storeVerificationOnChain(creatorAddress, provider, network = 'sepolia') {
    if (!VERIFICATION_ADMIN_KEY) {
        throw new Error('VERIFICATION_ADMIN_KEY not configured');
    }

    // Select the correct registry address and RPC
    const registryAddress = network === 'sonic'
        ? VERIFICATION_REGISTRY_SONIC_ADDRESS
        : VERIFICATION_REGISTRY_ADDRESS;

    const rpcUrl = network === 'sonic'
        ? process.env.SONIC_RPC || 'https://rpc.blaze.soniclabs.com'
        : process.env.SEPOLIA_RPC || 'https://rpc2.sepolia.org';

    if (!registryAddress) {
        throw new Error(`VerificationRegistry address not configured for ${network}`);
    }

    // Connect to the network
    const provider_rpc = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(VERIFICATION_ADMIN_KEY, provider_rpc);

    // Create contract instance
    const registry = new ethers.Contract(
        registryAddress,
        VERIFICATION_REGISTRY_ABI,
        wallet
    );

    // Get current nonce for the creator
    const nonce = await registry.nonces(creatorAddress);

    // Generate signature
    const signature = await generateVerificationSignature(creatorAddress, provider, nonce);

    // Call verifyCreator on-chain
    console.log(`[KRNL] Storing verification on ${network} for ${creatorAddress}...`);
    const tx = await registry.verifyCreator(creatorAddress, provider, nonce, signature);

    console.log(`[KRNL] Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();

    console.log(`[KRNL] Verification stored on-chain (block: ${receipt.blockNumber})`);
    return tx.hash;
}

/**
 * Check if a creator is verified on-chain
 * @param {string} creatorAddress - The wallet address to check
 * @param {string} network - Network to check ('sepolia' or 'sonic')
 * @returns {Promise<boolean>} True if verified
 */
export async function checkVerificationStatus(creatorAddress, network = 'sepolia') {
    const registryAddress = network === 'sonic'
        ? VERIFICATION_REGISTRY_SONIC_ADDRESS
        : VERIFICATION_REGISTRY_ADDRESS;

    const rpcUrl = network === 'sonic'
        ? process.env.SONIC_RPC || 'https://rpc.blaze.soniclabs.com'
        : process.env.SEPOLIA_RPC || 'https://rpc2.sepolia.org';

    if (!registryAddress) {
        console.warn(`[KRNL] VerificationRegistry not configured for ${network}`);
        return false;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const registry = new ethers.Contract(
        registryAddress,
        VERIFICATION_REGISTRY_ABI,
        provider
    );

    const isVerified = await registry.isVerified(creatorAddress);
    return isVerified;
}
