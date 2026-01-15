/**
 * Manual script to verify a creator on-chain
 * Use this to test the verification flow without waiting for Sumsub webhook
 * 
 * Run with: node scripts/manual_verify.js <creator_address>
 */

import { storeVerificationOnChain, checkVerificationStatus } from '../server/krnl.js';
import dotenv from 'dotenv';

dotenv.config();

const creatorAddress = process.argv[2];

if (!creatorAddress) {
    console.error('❌ Usage: node scripts/manual_verify.js <creator_address>');
    process.exit(1);
}

async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('Manual On-Chain Verification');
    console.log('='.repeat(60));
    console.log(`Creator: ${creatorAddress}`);
    console.log(`Network: Sonic Blaze`);
    console.log('='.repeat(60) + '\n');

    try {
        // Check current status
        console.log('1️⃣  Checking current verification status...');
        const isCurrentlyVerified = await checkVerificationStatus(creatorAddress, 'sonic');
        console.log(`   Current status: ${isCurrentlyVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED'}\n`);

        if (isCurrentlyVerified) {
            console.log('✅ Creator is already verified on-chain!');
            console.log('\nView on explorer:');
            console.log(`https://blaze.soniclabs.com/address/0x4D0e845A5099e77E57195A5a9EFb09053D264DAE`);
            return;
        }

        // Store verification
        console.log('2️⃣  Storing verification on-chain...');
        const txHash = await storeVerificationOnChain(
            creatorAddress.toLowerCase(),
            'sumsub',
            'sonic'
        );

        console.log(`\n✅ Verification stored successfully!`);
        console.log('='.repeat(60));
        console.log(`Transaction: ${txHash}`);
        console.log(`Explorer: https://blaze.soniclabs.com/tx/${txHash}`);
        console.log('='.repeat(60));

        // Verify it worked
        console.log('\n3️⃣  Verifying on-chain status...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

        const isNowVerified = await checkVerificationStatus(creatorAddress, 'sonic');
        console.log(`   New status: ${isNowVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED'}\n`);

        if (isNowVerified) {
            console.log('🎉 Success! Creator is now verified on-chain.');
        } else {
            console.log('⚠️  Verification transaction sent but status not updated yet. Please wait a few moments.');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.stack) {
            console.error('\nStack trace:');
            console.error(error.stack);
        }
        process.exit(1);
    }
}

main();
