/**
 * Deploy VerificationRegistry to both Sepolia and Sonic
 * Run with: node scripts/deploy_verification_both.js
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
const SONIC_RPC = 'https://rpc.blaze.soniclabs.com';
const SEPOLIA_RPC = 'https://1rpc.io/sepolia';

const VERIFICATION_REGISTRY_ABI = [
    'function verifyCreator(address creator, string provider, uint256 nonce, bytes signature) external',
    'function nonces(address) external view returns (uint256)',
    'function isVerified(address) external view returns (bool)',
    'function admin() external view returns (address)'
];

/**
 * Compile the VerificationRegistry contract
 */
function compileContract() {
    console.log('📦 Compiling VerificationRegistry.sol...\n');

    const contractPath = path.join(__dirname, '../src/contracts/VerificationRegistry.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

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

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        const errors = output.errors.filter(e => e.severity === 'error');
        if (errors.length > 0) {
            console.error('❌ Compilation errors:');
            errors.forEach(err => console.error(err.formattedMessage));
            process.exit(1);
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
 * Deploy to a specific network
 */
async function deployToNetwork(networkName, rpcUrl, compiled) {
    console.log(`\n🚀 Deploying to ${networkName}`);
    console.log('='.repeat(60));

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`Deployer: ${wallet.address}`);

    const balance = await provider.getBalance(wallet.address);
    console.log(`Balance: ${ethers.formatEther(balance)} ${networkName.includes('Sonic') ? 'S' : 'ETH'}`);

    if (balance === 0n) {
        throw new Error('Insufficient balance for deployment');
    }

    const factory = new ethers.ContractFactory(
        compiled.abi,
        compiled.bytecode,
        wallet
    );

    console.log('\n⏳ Deploying contract...');
    const contract = await factory.deploy(wallet.address); // Admin is deployer

    console.log(`Tx hash: ${contract.deploymentTransaction().hash}`);
    console.log('Waiting for confirmation...');

    await contract.waitForDeployment();

    const address = await contract.getAddress();
    const admin = await contract.admin();

    console.log('\n✅ Deployment successful!');
    console.log('='.repeat(60));
    console.log(`Contract: ${address}`);
    console.log(`Admin: ${admin}`);
    console.log('='.repeat(60));

    return address;
}

async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('VerificationRegistry Multi-Network Deployment');
    console.log('='.repeat(60) + '\n');

    try {
        // Step 1: Compile
        const compiled = compileContract();

        // Step 2: Deploy to Sonic
        const sonicAddress = await deployToNetwork('Sonic Blaze', SONIC_RPC, compiled);

        // Step 3: Deploy to Sepolia
        const sepoliaAddress = await deployToNetwork('Sepolia', SEPOLIA_RPC, compiled);

        // Step 4: Save artifacts
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
                },
                sepolia: {
                    address: sepoliaAddress,
                    deployedAt: new Date().toISOString()
                }
            }
        };

        fs.writeFileSync(
            path.join(outputDir, 'VerificationRegistry.json'),
            JSON.stringify(artifact, null, 2)
        );

        console.log('\n✅ Artifacts saved to artifacts_custom/VerificationRegistry.json');

        // Step 5: Display summary
        console.log('\n' + '='.repeat(60));
        console.log('📝 DEPLOYMENT SUMMARY');
        console.log('='.repeat(60));
        console.log(`Sonic Blaze: ${sonicAddress}`);
        console.log(`Sepolia:     ${sepoliaAddress}`);
        console.log('='.repeat(60));

        console.log('\n📝 Add these to your .env file:');
        console.log('='.repeat(60));
        console.log(`VERIFICATION_REGISTRY_SONIC_ADDRESS=${sonicAddress}`);
        console.log(`VERIFICATION_REGISTRY_ADDRESS=${sepoliaAddress}`);
        console.log(`VERIFICATION_ADMIN_KEY=${PRIVATE_KEY}`);
        console.log('='.repeat(60));

        console.log('\n🎉 Deployment complete!');
        console.log('\nNext steps:');
        console.log('1. Update .env with the addresses above');
        console.log('2. Update src/lib/abi.ts with the new addresses');
        console.log('3. Redeploy CampaignManager with verification registry addresses');
        console.log('4. Verify your creator address on both networks');

    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

main();
