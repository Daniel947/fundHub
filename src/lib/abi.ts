import { getAddress, type Chain } from 'viem';

/**
 * Custom chain definition for Sonic Blaze Testnet.
 */
export const sonicBlaze = {
    id: 57054,
    name: 'Sonic Blaze Testnet',
    nativeCurrency: { name: 'Sonic', symbol: 'S', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.blaze.soniclabs.com'] },
    },
    blockExplorers: {
        default: { name: 'SonicScan', url: 'https://blaze.soniclabs.com' },
    },
    testnet: true,
} as const satisfies Chain;

/**
 * Controls the active network environment for contract interactions.
 * Set VITE_APP_NETWORK=mainnet in .env to switch from testnet.
 */
export const APP_NETWORK = (import.meta.env?.VITE_APP_NETWORK || 'testnet').toLowerCase() as 'mainnet' | 'testnet';

// --- Testnet Addresses (Sonic Blaze & Sepolia) ---
const TESTNET_SONIC_CAMPAIGN_MANAGER = getAddress("0xdBD8d3bbD1Fd7D80d476113E682d5BC72E58BAB6");
const TESTNET_SONIC_IDENTITY_REGISTRY = getAddress("0x80d378214B14677E4b156420c9913eB60d31bE1A");
const TESTNET_SONIC_VERIFICATION_REGISTRY = getAddress("0x3C895d68F9Ef9c1Ed5EB0Ec38649b120f0AA6B3C");
const TESTNET_SONIC_FUND_ESCROW = getAddress("0x47868De05B9898af38FE06fd1611413194dd69c4");
const TESTNET_ETH_CAMPAIGN_MANAGER = getAddress("0x852f4D5cE44FDa736D082E29c8a5ED6E8e306Da0");
const TESTNET_ETH_VERIFICATION_REGISTRY = getAddress("0xe16091639b41fD74fEd513Dfde226D8edc63eeE0");
const TESTNET_ETH_FUND_ESCROW = getAddress("0x3ecB1c74B1E2c25F696CaC03525e7B254b32FE5f");

// --- Mainnet Addresses (Sonic & Ethereum) ---
// Note: These are placeholders and should be updated once deployed to mainnet
const MAINNET_SONIC_CAMPAIGN_MANAGER = getAddress("0x0000000000000000000000000000000000000000");
const MAINNET_SONIC_IDENTITY_REGISTRY = getAddress("0x0000000000000000000000000000000000000000");
const MAINNET_SONIC_VERIFICATION_REGISTRY = getAddress("0x0000000000000000000000000000000000000000");
const MAINNET_SONIC_FUND_ESCROW = getAddress("0x0000000000000000000000000000000000000000");
const MAINNET_ETH_CAMPAIGN_MANAGER = getAddress("0x0000000000000000000000000000000000000000");
const MAINNET_ETH_FUND_ESCROW = getAddress("0x0000000000000000000000000000000000000000");

// --- Exported Active Addresses ---
/**
 * Active CampaignManager contract address based on current network.
 */
export const CAMPAIGN_MANAGER_ADDRESS = APP_NETWORK === 'mainnet' ? MAINNET_SONIC_CAMPAIGN_MANAGER : TESTNET_SONIC_CAMPAIGN_MANAGER;
/**
 * Active IdentityRegistry contract address for KYC/AML verification.
 */
export const IDENTITY_REGISTRY_ADDRESS = APP_NETWORK === 'mainnet' ? MAINNET_SONIC_IDENTITY_REGISTRY : TESTNET_SONIC_IDENTITY_REGISTRY;
/**
 * Active FundEscrow contract address for the Sonic network.
 */
export const FUND_ESCROW_ADDRESS = APP_NETWORK === 'mainnet' ? MAINNET_SONIC_FUND_ESCROW : TESTNET_SONIC_FUND_ESCROW;

/**
 * Active VerificationRegistry contract address for on-chain KYC verification.
 */
export const VERIFICATION_REGISTRY_ADDRESS = APP_NETWORK === 'mainnet' ? MAINNET_SONIC_VERIFICATION_REGISTRY : TESTNET_SONIC_VERIFICATION_REGISTRY;

/**
 * Sepolia VerificationRegistry contract address for on-chain KYC verification.
 */
export const VERIFICATION_REGISTRY_SEPOLIA_ADDRESS = APP_NETWORK === 'mainnet' ? MAINNET_SONIC_VERIFICATION_REGISTRY : TESTNET_ETH_VERIFICATION_REGISTRY;

// For Ethereum dual-mode
/**
 * Active CampaignManager contract address on Ethereum (Sepolia for testnet).
 */
export const CAMPAIGN_MANAGER_SEPOLIA_ADDRESS = APP_NETWORK === 'mainnet' ? MAINNET_ETH_CAMPAIGN_MANAGER : TESTNET_ETH_CAMPAIGN_MANAGER;
/**
 * Active FundEscrow contract address on Ethereum (Sepolia for testnet).
 */
export const FUND_ESCROW_SEPOLIA_ADDRESS = APP_NETWORK === 'mainnet' ? MAINNET_ETH_FUND_ESCROW : TESTNET_ETH_FUND_ESCROW;

/**
 * Shared Application Binary Interface (ABI) for all CampaignManager instances.
 */
export const CAMPAIGN_MANAGER_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_escrowAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "creator",
                "type": "address"
            }
        ],
        "name": "CampaignCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
            }
        ],
        "name": "CampaignDisabled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "FundsLocked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "FundsReleased",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "milestoneIndex",
                "type": "uint256"
            }
        ],
        "name": "MilestoneReleased",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "status",
                "type": "bool"
            }
        ],
        "name": "TokenWhitelisted",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "CAMPAIGN_COOLDOWN",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_CAMPAIGNS_PER_USER",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_GOAL",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "activeCampaignCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "backerContributions",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "campaignBackers",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "campaignCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "campaignIds",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "campaigns",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "bytes32",
                "name": "internalId",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "creator",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "category",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "image",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "goal",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pledged",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "currency",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "endAt",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_description",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_category",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_image",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_goal",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "_currency",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_endDate",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "title",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "fundingPercentage",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "released",
                        "type": "bool"
                    }
                ],
                "internalType": "struct CampaignManager.Milestone[]",
                "name": "_milestones",
                "type": "tuple[]"
            }
        ],
        "name": "createCampaign",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
            }
        ],
        "name": "disableCampaign",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "campaignId",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "donate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fundEscrow",
        "outputs": [
            {
                "internalType": "contract IFundEscrow",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "campaignId",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "backer",
                "type": "address"
            }
        ],
        "name": "getBackerContribution",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "campaignId",
                "type": "bytes32"
            }
        ],
        "name": "getBackerCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "campaignId",
                "type": "bytes32"
            }
        ],
        "name": "getBackers",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCampaigns",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "internalId",
                        "type": "bytes32"
                    },
                    {
                        "internalType": "address",
                        "name": "creator",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "title",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "category",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "image",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "goal",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "pledged",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "currency",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "endAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "active",
                        "type": "bool"
                    }
                ],
                "internalType": "struct CampaignManager.Campaign[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "campaignId",
                "type": "bytes32"
            }
        ],
        "name": "getMilestones",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "title",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "fundingPercentage",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "released",
                        "type": "bool"
                    }
                ],
                "internalType": "struct CampaignManager.Milestone[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "lastCreatedAt",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "milestones",
        "outputs": [
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "fundingPercentage",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "bool",
                "name": "released",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "campaignId",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "recordExternalContribution",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "campaignId",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "milestoneIndex",
                "type": "uint256"
            }
        ],
        "name": "releaseMilestoneFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "status",
                "type": "bool"
            }
        ],
        "name": "whitelistToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "campaignId",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            }
        ],
        "name": "withdrawSurplus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

export const IDENTITY_REGISTRY_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "kycHash",
                "type": "string"
            }
        ],
        "name": "UserVerified",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "isUserVerified",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "isVerified",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "kycHash",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_kycHash",
                "type": "string"
            }
        ],
        "name": "verifySelf",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_kycHash",
                "type": "string"
            }
        ],
        "name": "verifyUser",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

export const FUND_ESCROW_ABI = [
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "campaignId",
                "type": "bytes32"
            }
        ],
        "name": "isCampaignRegistered",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "donor",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "campaignId",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "lockFunds",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "donor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "FundsLocked",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "campaignId",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            }
        ],
        "name": "lockedFunds",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export const ERC20_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "address", "name": "spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

/**
 * VerificationRegistry ABI for on-chain KYC verification status.
 * Used to check if a creator has completed KYC before allowing campaign creation.
 */
export const VERIFICATION_REGISTRY_ABI = [
    {
        "inputs": [{ "internalType": "address", "name": "_admin", "type": "address" }],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": false, "internalType": "string", "name": "provider", "type": "string" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "name": "CreatorVerified",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "name": "VerificationRevoked",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "admin",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "isVerified",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "nonces",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "verificationProvider",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "verifiedAt",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "creator", "type": "address" },
            { "internalType": "string", "name": "provider", "type": "string" },
            { "internalType": "uint256", "name": "nonce", "type": "uint256" },
            { "internalType": "bytes", "name": "signature", "type": "bytes" }
        ],
        "name": "verifyCreator",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;
