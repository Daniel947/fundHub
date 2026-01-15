/**
 * Compile and Deploy VerificationRegistry using solc-js
 * Run with: node scripts/deploy_verification_solc.js
 */

import solc from 'solc';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const APP_NETWORK = (process.env.APP_NETWORK || 'testnet').toLowerCase();

// Admin wallet for signing verification messages
const VERIFICATION_ADMIN_ADDRESS = process.env.VERIFICATION_ADMIN_ADDRESS || new ethers.Wallet(PRIVATE_KEY).address;

// Network configurations
const SONIC_RPC = APP_NETWORK === 'mainnet' ? 'https://rpc.soniclabs.com' : 'https://rpc.blaze.soniclabs.com';

/**
 * Compile the VerificationRegistry contract
 */
function compileContract() {
    console.log('📦 Compiling VerificationRegistry.sol...\n');

    // Read the contract source
    const contractPath = path.join(__dirname, '../src/contracts/VerificationRegistry.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    // Prepare input for solc
    const input = {
        language: 'Solidity',
        sources: {
            'VerificationRegistry.sol': {
                content: source
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode']
                }
            },
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    };

    // Compile
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // Check for errors
    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
            console.error('❌ Compilation errors:');
            errors.forEach(err => console.error(err.formattedMessage));
            process.exit(1);
        }

        // Show warnings
        const warnings = output.errors.filter(e => e.severity === 'warning');
        if (warnings.length > 0) {
            console.warn('⚠️  Compilation warnings:');
            warnings.forEach(warn => console.warn(warn.formattedMessage));
        }
    }

    const contract = output.contracts['VerificationRegistry.sol']['VerificationRegistry'];

    console.log('✅ Compilation successful!\n');

    return {
        abi: contract.abi,
        bytecode: '0x' + contract.evm.bytecode.object
    };
}

/**
 * Deploy the contract to a network
 */
async function deployToNetwork(networkName, rpcUrl, compiled) {
    console.log(`\n🚀 Deploying VerificationRegistry to ${networkName}...`);
    console.log('='.repeat(60));

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`Deployer: ${wallet.address}`);
    console.log(`Admin: ${VERIFICATION_ADMIN_ADDRESS}`);

    // Get balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`Balance: ${ethers.formatEther(balance)} ${networkName === 'Sonic Blaze' ? 'S' : 'ETH'}`);

    if (balance === 0n) {
        throw new Error('Insufficient balance for deployment');
    }

    // Create contract factory
    const factory = new ethers.ContractFactory(
        compiled.abi,
        compiled.bytecode,
        wallet
    );

    // Deploy
    console.log('\n⏳ Deploying contract...');
    const contract = await factory.deploy(VERIFICATION_ADMIN_ADDRESS);

    console.log(`Transaction hash: ${contract.deploymentTransaction().hash}`);
    console.log('Waiting for confirmation...');

    await contract.waitForDeployment();

    const address = await contract.getAddress();
    const admin = await contract.admin();

    console.log('\n✅ Deployment successful!');
    console.log('='.repeat(60));
    console.log(`Contract Address: ${address}`);
    console.log(`Admin Address: ${admin}`);
    console.log('='.repeat(60));

    return address;
}

/**
 * Main deployment function
 */
async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('KRNL VerificationRegistry Deployment');
    console.log('='.repeat(60) + '\n');

    try {
        // Step 1: Compile
        const compiled = compileContract();

        // Step 2: Deploy to Sonic
        const sonicAddress = await deployToNetwork('Sonic Blaze', SONIC_RPC, compiled);

        // Step 3: Save ABI and address
        const outputDir = path.join(__dirname, '../artifacts_custom');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const artifact = {
            contractName: 'VerificationRegistry',
            abi: compiled.abi,
            networks: {
                sonic: {
                    address: sonicAddress,
                    deployedAt: new Date().toISOString()
                }
            }
        };

        fs.writeFileSync(
            path.join(outputDir, 'VerificationRegistry.json'),
            JSON.stringify(artifact, null, 2)
        );

        console.log('\n✅ Artifact saved to artifacts_custom/VerificationRegistry.json');

        // Step 4: Display environment variables
        console.log('\n' + '='.repeat(60));
        console.log('📝 Add these to your .env file:');
        console.log('='.repeat(60));
        console.log(`VERIFICATION_REGISTRY_SONIC_ADDRESS=${sonicAddress}`);
        console.log(`VERIFICATION_ADMIN_KEY=${PRIVATE_KEY}`);
        console.log('='.repeat(60));

        console.log('\n🎉 Deployment complete!');
        console.log('\nNext steps:');
        console.log('1. Add the environment variables above to your .env file');
        console.log('2. Redeploy CampaignManager with the VerificationRegistry address');
        console.log('3. Configure Sumsub webhook: https://your-domain.com/api/sumsub/webhook');

    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

main();
