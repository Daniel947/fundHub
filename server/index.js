// --- 1. Infrastructure & Utilities ---
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import multer from 'multer';
import FormData from 'form-data';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { ethers } from 'ethers';
import pkg from 'pg';
const { Pool } = pkg;

// Admin addresses for dashboard access
const ADMIN_ADDRESSES = (process.env.ADMIN_ADDRESSES || '').toLowerCase().split(',').map(a => a.trim()).filter(Boolean);
/**
 * BTC utility functions for address derivation from platform xPub.
 * @see ./btc.js
 */
import { deriveCampaignBtcAddress, generatePlatformXPub } from './btc.js';
import {
    CAMPAIGN_MANAGER_ABI,
    CAMPAIGN_MANAGER_ADDRESS,
    CAMPAIGN_MANAGER_SEPOLIA_ADDRESS,
    FUND_ESCROW_ABI,
    FUND_ESCROW_ADDRESS,
    FUND_ESCROW_SEPOLIA_ADDRESS
} from '../src/lib/abi.ts';
import { storeVerificationOnChain } from './krnl.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const COMMENTS_FILE = join(__dirname, 'comments.json');

const app = express();

// CORS Configuration - Allow multiple frontend origins
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:8080',
            'http://localhost:3000'
        ];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-address'],
    maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fundhub';
/**
 * PostgreSQL connection pool.
 * Used for storing campaign metadata, blockchain events, and community comments.
 */
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: false // Set to true if using hosted DB with SSL
});

/**
 * Initializes the database schema if it doesn't already exist.
 * Sets up tables for sync state, campaigns, events, comments, and creator profiles.
 */
async function initDb() {
    console.log('[DB] Initializing database...');
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sync_state (
                network TEXT PRIMARY KEY,
                last_block BIGINT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS campaigns (
                campaign_id TEXT PRIMARY KEY,
                creator TEXT NOT NULL,
                title TEXT,
                description TEXT,
                goal NUMERIC,
                pledged NUMERIC DEFAULT 0,
                start_at BIGINT,
                end_at BIGINT,
                active BOOLEAN DEFAULT TRUE,
                claimed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- Migration for existing campaigns
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='campaigns' AND column_name='active') THEN
                    ALTER TABLE campaigns ADD COLUMN active BOOLEAN DEFAULT TRUE;
                END IF;
            END $$;

            CREATE INDEX IF NOT EXISTS idx_campaigns_creator ON campaigns(creator);

            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                network TEXT NOT NULL,
                block_number BIGINT NOT NULL,
                transaction_hash TEXT NOT NULL,
                event_name TEXT NOT NULL,
                args JSONB NOT NULL,
                explorer_url TEXT,
                campaign_id TEXT,
                block_timestamp TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_events_campaign_id ON events(campaign_id);

            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                campaign_id TEXT NOT NULL,
                user_name TEXT NOT NULL,
                author_address TEXT NOT NULL,
                content TEXT NOT NULL,
                time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                is_creator BOOLEAN DEFAULT FALSE,
                network TEXT NOT NULL DEFAULT 'sonic'
            );

            CREATE INDEX IF NOT EXISTS idx_comments_campaign_id ON comments(campaign_id);

            CREATE INDEX IF NOT EXISTS idx_comments_campaign_id ON comments(campaign_id);

            CREATE TABLE IF NOT EXISTS creator_profiles (
                address TEXT PRIMARY KEY,
                name TEXT,
                bio TEXT,
                avatar TEXT,
                type TEXT DEFAULT 'Individual',
                location TEXT,
                website TEXT,
                twitter TEXT,
                linkedin TEXT,
                focus_areas JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS creator_follows (
                id SERIAL PRIMARY KEY,
                follower_address TEXT NOT NULL,
                creator_address TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(follower_address, creator_address)
            );

            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                admin_address TEXT,
                action TEXT NOT NULL,
                target_type TEXT,
                target_id TEXT,
                details JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_follower ON creator_follows(follower_address);
            CREATE INDEX IF NOT EXISTS idx_creator ON creator_follows(creator_address);
        `);

        // Migration: Ensure is_creator column exists
        try {
            await pool.query(`
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                   WHERE table_name='comments' AND column_name='is_creator') THEN 
                        ALTER TABLE comments ADD COLUMN is_creator BOOLEAN DEFAULT FALSE; 
                    END IF; 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                   WHERE table_name='comments' AND column_name='parent_id') THEN 
                        ALTER TABLE comments ADD COLUMN parent_id INTEGER REFERENCES comments(id); 
                    END IF; 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                   WHERE table_name='comments' AND column_name='network') THEN 
                        ALTER TABLE comments ADD COLUMN network TEXT NOT NULL DEFAULT 'sonic'; 
                    END IF; 
                END $$;
            `);

            // Check if campaigns table is empty, if so, force resync
            const campaignCheck = await pool.query('SELECT COUNT(*) FROM campaigns');
            if (parseInt(campaignCheck.rows[0].count) === 0) {
                console.log('[DB] Campaigns table empty. Resetting sync state to re-index events...');
                await pool.query('DELETE FROM sync_state');
            }

        } catch (err) {
            console.error('[DB] Migration error:', err.message);
        }

        console.log('[DB] Database initialized successfully.');
    } catch (err) {
        console.error('[DB] Initialization error:', err.message);
    }
}

const SUMSUB_APP_TOKEN = (process.env.VITE_SUMSUB_APP_TOKEN || '').trim();
const SUMSUB_SECRET_KEY = (process.env.VITE_SUMSUB_SECRET_KEY || '').trim();
const SUMSUB_LEVEL_NAME = (process.env.VITE_SUMSUB_LEVEL_NAME || 'basic-kyc-level').trim();
const SUMSUB_BASE_URL = 'https://api.sumsub.com';

const PINATA_JWT = (process.env.VITE_PINATA_JWT || '').trim();
const PINATA_GATEWAY = (process.env.VITE_GATEWAY_URL || 'rose-certain-pinniped-192.mypinata.cloud').trim();

// Multer config for image uploads with security restrictions
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
        }
    }
});

// Platform config
const PRIVATE_KEY = process.env.PRIVATE_KEY;
let PLATFORM_XPUB = process.env.PLATFORM_XPUB;

if (!PLATFORM_XPUB) {
    console.log('Generating new Platform xPub...');
    PLATFORM_XPUB = generatePlatformXPub();
    console.warn('IMPORTANT: Save the generated PLATFORM_XPUB to your .env file to keep addresses stable across restarts!');
}

// Providers & Signers for Oracle actions
const APP_NETWORK = (process.env.APP_NETWORK || process.env.VITE_APP_NETWORK || 'testnet').toLowerCase();

// Define RPCs based on network
const SONIC_RPC = APP_NETWORK === 'mainnet' ? 'https://rpc.soniclabs.com' : 'https://rpc.blaze.soniclabs.com';
const ETH_RPC = APP_NETWORK === 'mainnet' ? 'https://1rpc.io/eth' : 'https://1rpc.io/sepolia';

const sonicProvider = new ethers.JsonRpcProvider(SONIC_RPC);
const ethProvider = new ethers.JsonRpcProvider(ETH_RPC);

const wallet = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, sonicProvider) : null;

// Contracts for indexing & oracle
// These addresses are imported from ../src/lib/abi.ts and are already network-aware
const sonicCampaignManager = new ethers.Contract(CAMPAIGN_MANAGER_ADDRESS, CAMPAIGN_MANAGER_ABI, sonicProvider);
const ethCampaignManager = new ethers.Contract(CAMPAIGN_MANAGER_SEPOLIA_ADDRESS, CAMPAIGN_MANAGER_ABI, ethProvider);
const sonicEscrow = new ethers.Contract(FUND_ESCROW_ADDRESS, FUND_ESCROW_ABI, sonicProvider);
const ethEscrow = new ethers.Contract(FUND_ESCROW_SEPOLIA_ADDRESS, FUND_ESCROW_ABI, ethProvider);

// Oracle Campaign Manager (uses wallet for writes)
const oracleCampaignManager = wallet ? new ethers.Contract(CAMPAIGN_MANAGER_ADDRESS, CAMPAIGN_MANAGER_ABI, wallet) : null;

// --- 2. Identity & Storage (Sumsub/Pinata) ---

/**
 * Helper to sign the request as per Sumsub requirements.
 * Sumsub requires HMAC-SHA256 signatures for all API calls.
 */
function createSignature(config) {
    const ts = Math.floor(Date.now() / 1000);
    const method = config.method.toUpperCase();

    // Robustly extract /resources/... part including query params
    const fullUrl = new URL(config.url);
    const url = fullUrl.pathname + fullUrl.search;

    // Sumsub requires empty string for body if no data
    const body = config.data ? JSON.stringify(config.data) : '';

    const data = ts + method + url + body;
    const signature = crypto.createHmac('sha256', SUMSUB_SECRET_KEY).update(data).digest('hex');

    // console.log('Secret key exists:', !!SUMSUB_SECRET_KEY);

    return { ts, signature };
}

app.post('/api/sumsub-token', async (req, res) => {
    const { externalUserId, levelName } = req.body;

    if (!externalUserId) {
        return res.status(400).json({ error: 'externalUserId is required' });
    }

    const targetLevel = levelName || SUMSUB_LEVEL_NAME;

    try {
        const queryParams = new URLSearchParams({
            userId: externalUserId,
            levelName: targetLevel
        }).toString();

        const config = {
            method: 'post',
            url: `${SUMSUB_BASE_URL}/resources/accessTokens?${queryParams}`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-App-Token': SUMSUB_APP_TOKEN,
            }
        };

        const { ts, signature } = createSignature(config);
        config.headers['X-App-Access-Sig'] = signature;
        config.headers['X-App-Access-Ts'] = ts;

        const response = await axios(config);
        console.log('Sumsub Success:', response.status);
        res.json(response.data);
    } catch (error) {
        console.error('Sumsub Error Details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            attemptedLevel: targetLevel
        });

        // If we get a 404 with a specific message, it's usually the Level Name
        let errorMessage = 'Failed to generate Sumsub token';
        if (error.response?.status === 404) {
            errorMessage = `Sumsub Level '${targetLevel}' not found. Please check your Dashboard settings.`;
        } else if (error.response?.data?.description) {
            errorMessage = error.response.data.description;
        }

        res.status(error.response?.status || 500).json({
            error: errorMessage,
            details: error.response?.data,
            levelAttempted: targetLevel
        });
    }
});

/**
 * POST /api/sumsub/webhook
 * Receives notifications from Sumsub when KYC verification status changes.
 * Automatically stores verification on-chain (Sonic) when approved.
 */
app.post('/api/sumsub/webhook', express.json(), async (req, res) => {
    try {
        const { type, externalUserId, reviewResult } = req.body;
        console.log('[Sumsub Webhook] Received:', { type, externalUserId });

        if (type === 'applicantReviewed' && reviewResult?.reviewAnswer === 'GREEN' && externalUserId) {
            console.log(`[Sumsub Webhook] KYC APPROVED for ${externalUserId}`);

            // Store verification on both networks
            const networks = ['sonic', 'sepolia'];
            const results = await Promise.allSettled(networks.map(net =>
                storeVerificationOnChain(externalUserId.toLowerCase(), 'sumsub', net)
            ));

            // Log results
            results.forEach((result, index) => {
                const net = networks[index];
                if (result.status === 'fulfilled') {
                    console.log(`[Sumsub Webhook] ✅ On-chain verification stored on ${net}: ${result.value}`);
                } else {
                    console.error(`[Sumsub Webhook] ❌ Failed to store verification on ${net}:`, result.reason.message);
                }
            });

            // If at least one succeeded, we consider it a partial success (don't fail the webhook)
            if (results.every(r => r.status === 'rejected')) {
                console.error('[Sumsub Webhook] Failed to store verification on any network');
            }
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('[Sumsub Webhook] Error:', error.message);
        res.status(200).json({ received: true, error: error.message });
    }
});

// Pinata IPFS Upload Endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        const pinataResponse = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${PINATA_JWT}`,
                },
                maxBodyLength: Infinity,
            }
        );

        const cid = pinataResponse.data.IpfsHash;
        const gatewayUrl = `https://${PINATA_GATEWAY}/ipfs/${cid}`;

        console.log('Pinata Success:', cid);
        res.json({
            cid,
            url: gatewayUrl
        });
    } catch (error) {
        console.error('Pinata Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to upload to IPFS',
            details: error.response?.data
        });
    }
});

// --- 3. Community & Event Indexing ---

// --- Event Indexing Logic (PostgreSQL) ---

/**
 * Retrieves the current synchronization state from the database.
 * If no state is found, it defaults to hardcoded block numbers to ensure a full scan.
 */
async function getSyncState() {
    try {
        const res = await pool.query('SELECT network, last_block FROM sync_state');
        const state = { sonic: 70000000, ethereum: 9900000 }; // Reset start blocks to ensure all history
        res.rows.forEach(row => {
            state[row.network] = parseInt(row.last_block);
        });
        return state;
    } catch (err) {
        console.error('[Indexer] Error reading sync state:', err);
        return { sonic: 69970000, ethereum: 7500000 };
    }
}

async function updateSyncState(network, block) {
    await pool.query(
        'INSERT INTO sync_state (network, last_block) VALUES ($1, $2) ON CONFLICT (network) DO UPDATE SET last_block = $2',
        [network, block]
    );
}

/**
 * persists an array of blockchain events to the database.
 * Handles campaign registration and creator mapping based on 'CampaignCreated' events.
 */
async function saveEvents(events) {
    if (events.length === 0) return;

    console.log(`[DB] Saving ${events.length} new events...`);

    for (const e of events) {
        try {
            // Find campaign ID - try 'id' then 'campaignId'
            let campaignId = (e.args.id || e.args.campaignId || '').toLowerCase();

            // Validation: campaignId should be 66 chars (bytes32). 
            // If it's 42 chars, it might be the creator address incorrectly mapped.
            if (campaignId && campaignId.length === 42 && e.eventName === 'CampaignCreated') {
                console.warn(`[DB] Warning: CampaignCreated ID for ${e.id} is an address (${campaignId}). Linkage might fail.`);
            }

            // 1. Persist the Event
            await pool.query(
                `INSERT INTO events (id, network, block_number, transaction_hash, event_name, args, explorer_url, campaign_id, block_timestamp)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 ON CONFLICT (id) DO NOTHING`,
                [e.id, e.network, e.blockNumber, e.transactionHash, e.eventName, JSON.stringify(e.args), e.explorerUrl, campaignId || null, e.blockTimestamp]
            );

            // 2. Handle Campaign Creation (for isCreator checks)
            if (e.eventName === 'CampaignCreated' && campaignId) {
                const creator = e.args.creator || e.args.owner || e.args.admin;
                if (creator) {
                    await pool.query(
                        `INSERT INTO campaigns (campaign_id, creator)
                         VALUES ($1, $2)
                         ON CONFLICT (campaign_id) DO UPDATE SET creator = EXCLUDED.creator`,
                        [campaignId.toLowerCase(), creator.toLowerCase()]
                    );
                    console.log(`[DB] Registered campaign ${campaignId} with creator ${creator}`);
                }
            }

            // 3. [CLEANSED] Update Donor Profile Logic
            // Backend no longer indexes donor stats or badges to database. 
            // This is now handled (or will be) on-chain or simply not stored off-chain.
            /*
            const donorAddr = e.args.donor ? e.args.donor.toLowerCase() : null;
            if (donorAddr && e.eventName === 'FundsLocked') {
                ...
                // Logic removed as per "Cleanse Backend" request
                ...
            }
            */
        } catch (err) {
            console.error('[Indexer] Error saving event:', err.message);
        }
    }
}

/**
 * Core indexing function that scans Sonic and Ethereum for new contract events.
 * Scans for 'CampaignCreated', 'FundsLocked', 'FundsReleased', and 'MilestoneReleased'.
 * Uses eth_getLogs for efficient batch fetching from multiple RPC endpoints.
 */
async function syncEvents() {
    console.log('[Indexer] Syncing all networks...');
    const syncState = await getSyncState();

    const networks = [
        { name: 'sonic', provider: sonicProvider, contracts: [sonicCampaignManager, sonicEscrow], stateKey: 'sonic', explorer: 'https://testnet.sonicscan.org/tx/', batchSize: 100000 },
        { name: 'ethereum', provider: ethProvider, contracts: [ethCampaignManager, ethEscrow], stateKey: 'ethereum', explorer: 'https://sepolia.etherscan.io/tx/', batchSize: 2000 }
    ];

    await Promise.all(networks.map(async (net) => {
        try {
            const currentBlock = await net.provider.getBlockNumber();
            let fromBlock = syncState[net.stateKey];

            if (fromBlock >= currentBlock) return;

            const toBlock = Math.min(fromBlock + net.batchSize, currentBlock);
            console.log(`[Indexer] ${net.name} sync: ${fromBlock} -> ${toBlock} (Head: ${currentBlock})`);

            const newEvents = [];
            const blockTimestampCache = {};
            for (const contract of net.contracts) {

                try {
                    let logs = [];
                    try {
                        const rpcUrls = [
                            'https://1rpc.io/sepolia',
                            'https://ethereum-sepolia-rpc.publicnode.com',
                            'https://rpc2.sepolia.org'
                        ];

                        const contractAddr = (await contract.getAddress()).toLowerCase();

                        const rpcPayload = {
                            jsonrpc: "2.0",
                            id: Date.now(),
                            method: "eth_getLogs",
                            params: [{
                                fromBlock: "0x" + fromBlock.toString(16),
                                toBlock: "0x" + toBlock.toString(16),
                                address: contractAddr
                            }]
                        };

                        let response;
                        let success = false;
                        for (const url of rpcUrls) {
                            try {
                                const targetUrl = (net.name === 'ethereum' ? url : 'https://rpc.blaze.soniclabs.com');
                                response = await axios.post(targetUrl, rpcPayload, { timeout: 10000 });
                                success = true;
                                break;
                            } catch (err) {
                                console.warn(`[Indexer] ${url} failed, trying next...`);
                            }
                        }

                        if (!success) throw new Error("All RPCs failed");
                        if (response.data.error) throw new Error(response.data.error.message);
                        logs = response.data.result || [];

                        if (logs.length > 0) {
                            console.log(`[Indexer] Found ${logs.length} raw logs in range ${fromBlock}-${toBlock} on ${net.name}`);
                            // Log the block numbers found to see if we hit the target
                            const blocks = [...new Set(logs.map(l => parseInt(l.blockNumber, 16)))];
                            console.log(`[Indexer] Blocks with events: ${blocks.join(', ')}`);
                        }
                    } catch (e) {
                        console.error(`[Indexer] RPC Error for ${net.name}: ${e.message}`);
                        continue;
                    }

                    for (const log of logs) {
                        try {
                            // Ensure properties exist and are handled correctly
                            const txHash = log.transactionHash || log.transaction_hash || "";
                            const blockNum = parseInt(log.blockNumber, 16);
                            const lIndex = parseInt(log.logIndex, 16);

                            const parsed = contract.interface.parseLog({
                                topics: log.topics,
                                data: log.data
                            });

                            if (!parsed) continue;

                            const eventData = {
                                id: `${net.name}-${txHash}-${lIndex}`,
                                network: net.name,
                                blockNumber: blockNum,
                                transactionHash: txHash,
                                eventName: parsed.name,
                                args: {},
                                explorerUrl: net.explorer + txHash,
                                blockTimestamp: null // Will fill below
                            };

                            // Get timestamp (with tiny cache)
                            if (!blockTimestampCache[blockNum]) {
                                try {
                                    const block = await net.provider.getBlock(blockNum);
                                    blockTimestampCache[blockNum] = new Date(block.timestamp * 1000).toISOString();
                                } catch (e) {
                                    blockTimestampCache[blockNum] = new Date().toISOString(); // Fallback
                                }
                            }
                            eventData.blockTimestamp = blockTimestampCache[blockNum];

                            // Correctly extract args using toObject() in ethers v6
                            const rawArgs = parsed.args.toObject();
                            Object.keys(rawArgs).forEach(key => {
                                let val = rawArgs[key];
                                if (typeof val === 'bigint') {
                                    eventData.args[key] = val.toString();
                                } else if (typeof val === 'object' && val !== null && val.hash) {
                                    eventData.args[key] = val.hash;
                                } else {
                                    eventData.args[key] = val;
                                }
                            });

                            console.log(`[Indexer] Persisting ${parsed.name} with ID ${eventData.id}`);
                            newEvents.push(eventData);
                        } catch (e) {
                            console.warn(`[Indexer] Failed to parse log in ${net.name}:`, e.message);
                        }
                    }
                } catch (err) {
                    console.error(`[Indexer] Error fetching logs for ${net.name} contract:`, err.message);
                }
            }

            if (newEvents.length > 0) {
                await saveEvents(newEvents);
            }
            await updateSyncState(net.stateKey, toBlock + 1);
        } catch (error) {
            console.error(`[Indexer] Fatal error syncing ${net.name}:`, error.message);
        }
    }));
}

// --- 4. API Routes ---

// Routes for Indexed Data (SQL)
app.get('/api/activity/:campaignId', async (req, res) => {
    const { campaignId } = req.params;
    const { network } = req.query;

    try {
        let query = 'SELECT *, block_timestamp as time FROM events WHERE campaign_id = $1 AND (args->>\'donor\' IS NOT NULL OR event_name != \'FundsLocked\')';
        let params = [campaignId.toLowerCase()];

        if (network) {
            query += ' AND network = $2';
            params.push(network.toString().toLowerCase());
        }

        query += ' ORDER BY block_number DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/btc/address/:campaignId
 * Derives a unique segregated witness (SegWit) BTC address for a campaign.
 * This address is deterministic based on the campaign ID and platform xPub.
 */
app.get('/api/btc/address/:campaignId', async (req, res) => {
    const { campaignId } = req.params;
    try {
        const xpub = PLATFORM_XPUB;
        const address = deriveCampaignBtcAddress(xpub, campaignId);
        const network = process.env.BTC_NETWORK || 'mainnet';
        res.json({ address, network });
    } catch (err) {
        console.error('[API] BTC Address Error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/btc/monitor/:address
 * Fetches real-time status, balance, and transaction history for a BTC address.
 * Interacts with public block explorers (Blockstream API).
 */
app.get('/api/btc/monitor/:address', async (req, res) => {
    const { address } = req.params;
    try {
        const networkType = process.env.BTC_NETWORK || 'mainnet';
        const baseUrl = networkType === 'testnet' ? 'https://blockstream.info/testnet/api/' : 'https://blockstream.info/api/';

        // Fetch Address Stats (contains gross received)
        const statsResponse = await axios.get(`${baseUrl}address/${address}`);
        const stats = statsResponse.data;

        // Fetch Recent Transactions (for backers list)
        const txResponse = await axios.get(`${baseUrl}address/${address}/txs`);
        const txs = txResponse.data;

        // Calculate current unconfirmed balance from stats
        const unconfirmedSats = stats.mempool_stats.funded_txo_sum - stats.mempool_stats.spent_txo_sum;
        const totalReceivedSats = stats.chain_stats.funded_txo_sum + stats.mempool_stats.funded_txo_sum;

        // Map transactions to a "Backers" friendly format
        const backers = txs.map(tx => {
            // Find outputs going to this campaign address
            const amountSats = tx.vout.reduce((sum, output) => {
                return (output.scriptpubkey_address === address) ? sum + output.value : sum;
            }, 0);

            return {
                address: tx.vin[0]?.prevout?.scriptpubkey_address || 'Anonymous', // Source address
                amount: (amountSats / 100000000).toString(),
                txid: tx.txid,
                time: tx.status.block_time || Math.floor(Date.now() / 1000),
                confirmed: tx.status.confirmed
            };
        }).filter(b => Number(b.amount) > 0); // Only include txs that sent funds to this address

        res.json({
            address,
            totalBtc: (stats.chain_stats.funded_txo_sum - stats.chain_stats.spent_txo_sum + unconfirmedSats) / 100000000,
            totalReceivedBtc: totalReceivedSats / 100000000,
            unconfirmedBtc: unconfirmedSats / 100000000,
            utxoCount: stats.chain_stats.funded_txo_count + stats.mempool_stats.funded_txo_count,
            hasPending: unconfirmedSats > 0,
            backers: backers
        });
    } catch (err) {
        console.error('[API] BTC Monitor Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch BTC status' });
    }
});

/**
 * POST /api/btc/stats/batch
 * Efficiently fetches basic balance information for multiple BTC campaigns in one call.
 */
app.post('/api/btc/stats/batch', async (req, res) => {
    const { campaignIds } = req.body;
    if (!Array.isArray(campaignIds)) {
        return res.status(400).json({ error: 'campaignIds must be an array' });
    }

    try {
        const xpub = PLATFORM_XPUB;
        const networkType = process.env.BTC_NETWORK || 'mainnet';
        const baseUrl = networkType === 'testnet' ? 'https://blockstream.info/testnet/api/' : 'https://blockstream.info/api/';

        const results = await Promise.all(campaignIds.map(async (id) => {
            try {
                const address = deriveCampaignBtcAddress(xpub, id);
                const statsResponse = await axios.get(`${baseUrl}address/${address}`);
                const stats = statsResponse.data;
                const totalReceivedSats = stats.chain_stats.funded_txo_sum + stats.mempool_stats.funded_txo_sum;

                return {
                    internalId: id,
                    address,
                    totalReceivedBtc: totalReceivedSats / 100000000,
                    backerCount: stats.chain_stats.funded_txo_count + stats.mempool_stats.funded_txo_count
                };
            } catch (err) {
                return { internalId: id, error: err.message };
            }
        }));

        res.json(results);
    } catch (err) {
        console.error('[API] BTC Batch Stats Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch batch BTC stats' });
    }
});

// [REMOVED] GET /api/backers/:campaignId - Backer list is now on-chain
// [REMOVED] GET /api/rewards/:address - Gamification logic stopped related to backend indexing

app.get('/api/rewards/:address', async (req, res) => {
    const { address } = req.params;
    try {
        const result = await pool.query(
            'SELECT impact_points as points, badges FROM donor_profiles WHERE address = $1',
            [address.toLowerCase()]
        );
        res.json(result.rows[0] || { points: 0, badges: [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [CLEANSED] GET /api/campaigns/stats - Indexer shutdown
// app.get('/api/campaigns/stats', async (req, res) => { ... });

app.get('/api/campaign/:id/stats', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT 
                network,
                args->>'token' as token,
                SUM((args->>'amount')::NUMERIC) as raised
             FROM events 
             WHERE LOWER(campaign_id) = $1 AND event_name = 'FundsLocked' AND args->>'donor' IS NOT NULL
             GROUP BY network, args->>'token'`,
            [id.toLowerCase()]
        );

        res.json({
            totals: result.rows.map(r => ({
                network: r.network,
                token: r.token,
                raised: r.raised.toString()
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/creator/:address/stats', async (req, res) => {
    const { address } = req.params;
    try {
        // 1. Get all campaigns by this creator from event logs or provide them via query
        const campaignsRes = await pool.query(
            "SELECT campaign_id FROM events WHERE event_name = 'CampaignCreated' AND LOWER(args->>'creator') = $1",
            [address.toLowerCase()]
        );

        const campaignIds = campaignsRes.rows.map(r => r.campaign_id.toLowerCase());

        if (campaignIds.length === 0) {
            return res.json({ totalRaised: "0", totalBackers: 0, campaignCount: 0 });
        }

        // 2. Sum donations across these campaigns, grouped by network and token address
        const statsByNetwork = await pool.query(
            `SELECT 
                network,
                args->>'token' as token,
                SUM((args->>'amount')::NUMERIC) as raised
             FROM events 
             WHERE LOWER(campaign_id) = ANY($1) AND event_name = 'FundsLocked'
             GROUP BY network, args->>'token'`,
            [campaignIds]
        );

        // 3. Get total unique backers across all campaigns
        const backersRes = await pool.query(
            `SELECT COUNT(DISTINCT LOWER(args->>'donor')) as backers
             FROM events 
             WHERE LOWER(campaign_id) = ANY($1) AND event_name = 'FundsLocked'`,
            [campaignIds]
        );

        res.json({
            totals: statsByNetwork.rows.map(r => ({
                network: r.network,
                token: r.token,
                raised: r.raised.toString(),
                // We'll let the frontend resolve the symbol/decimals for maximum flexibility
            })),
            totalBackers: parseInt(backersRes.rows[0].backers) || 0,
            campaignCount: campaignIds.length
        });
    } catch (err) {
        console.error('Error fetching creator stats:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/creator/:address/activity', async (req, res) => {
    const { address } = req.params;
    try {
        // 1. Get all campaigns by this creator
        const campaignsRes = await pool.query(
            "SELECT campaign_id FROM campaigns WHERE creator = $1",
            [address.toLowerCase()]
        );

        const campaignIds = campaignsRes.rows.map(r => r.campaign_id.toLowerCase());

        if (campaignIds.length === 0) {
            return res.json([]);
        }

        // 2. Get events for these campaigns
        const result = await pool.query(
            `SELECT *, block_timestamp as time FROM events 
             WHERE campaign_id = ANY($1) 
             ORDER BY block_number DESC, id DESC LIMIT 50`,
            [campaignIds]
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching creator activity:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- 4. Admin Dashboard Endpoints ---

/**
 * Middleware to check if the caller is an authorized admin.
 * For simplicity in this version, we check a header 'x-admin-address'.
 * In production, this would be a session or JWT based on a signed message.
 */
const isAdmin = (req, res, next) => {
    const adminAddr = (req.headers['x-admin-address'] || '').toLowerCase();
    if (ADMIN_ADDRESSES.length > 0 && !ADMIN_ADDRESSES.includes(adminAddr)) {
        return res.status(403).json({ error: 'Unauthorized: Admin access only' });
    }
    next();
};

/**
 * GET /api/admin/stats
 * Global statistics for the platform overview.
 */
app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
        // 1. Total Pledged by token/network
        const pledgedRes = await pool.query(`
            SELECT 
                network,
                args->>'token' as token,
                SUM((args->>'amount')::NUMERIC) as raised
            FROM events 
            WHERE event_name = 'FundsLocked'
            GROUP BY network, args->>'token'
        `);

        // 2. Global counts
        const countsRes = await pool.query(`
            SELECT 
                COALESCE((SELECT COUNT(*) FROM campaigns), 0) as total_campaigns,
                COALESCE((SELECT COUNT(*) FROM campaigns WHERE active = true), 0) as active_campaigns,
                COALESCE((SELECT COUNT(DISTINCT LOWER(args->>'donor')) FROM events WHERE event_name = 'FundsLocked' AND args->>'donor' IS NOT NULL), 0) as total_backers
        `);

        res.json({
            pledged: pledgedRes.rows,
            counts: {
                totalCampaigns: parseInt(countsRes.rows[0].total_campaigns),
                activeCampaigns: parseInt(countsRes.rows[0].active_campaigns),
                totalBackers: parseInt(countsRes.rows[0].total_backers)
            }
        });
    } catch (err) {
        console.error('[Admin API] Error fetching stats:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/admin/campaigns
 * Detailed list of all campaigns for moderation.
 */
app.get('/api/admin/campaigns', isAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, p.name as creator_name 
            FROM campaigns c
            LEFT JOIN creator_profiles p ON LOWER(c.creator) = LOWER(p.address)
            ORDER BY c.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('[Admin API] Error fetching campaigns:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/admin/audit-logs
 * Fetch platform audit history.
 */
app.get('/api/admin/audit-logs', isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
        res.json(result.rows);
    } catch (err) {
        console.error('[Admin API] Error fetching audit logs:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/admin/campaigns/:id/moderate
 * Flag or pause a campaign.
 */
app.post('/api/admin/campaigns/:id/moderate', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { action, reason, adminAddress } = req.body;

    try {
        let query = '';
        if (action === 'pause') {
            query = 'UPDATE campaigns SET active = false WHERE campaign_id = $1';
        } else if (action === 'resume') {
            query = 'UPDATE campaigns SET active = true WHERE campaign_id = $1';
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        await pool.query(query, [id]);

        // Log the action
        await pool.query(
            'INSERT INTO audit_logs (admin_address, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)',
            [adminAddress, action, 'campaign', id, JSON.stringify({ reason })]
        );

        res.json({ success: true, action });
    } catch (err) {
        console.error('[Admin API] Error moderating campaign:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- Creator Profile Endpoints ---

/**
 * GET /api/creator/:address
 * Get creator profile information
 */
app.get('/api/creator/:address', async (req, res) => {
    const { address } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM creator_profiles WHERE LOWER(address) = LOWER($1)',
            [address]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Creator profile not found' });
        }

        const profile = result.rows[0];
        res.json({
            address: profile.address,
            name: profile.name,
            bio: profile.bio,
            avatar: profile.avatar,
            type: profile.type,
            location: profile.location,
            website: profile.website,
            twitter: profile.twitter,
            linkedin: profile.linkedin,
            focusAreas: profile.focus_areas || [],
            createdAt: profile.created_at,
            updatedAt: profile.updated_at
        });
    } catch (err) {
        console.error('[API] Error fetching creator profile:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /api/creator/:address
 * Update creator profile information
 */
app.put('/api/creator/:address', async (req, res) => {
    const { address } = req.params;
    const { name, bio, avatar, type, location, website, twitter, linkedin, focusAreas } = req.body;

    console.log('[API] PUT /api/creator/:address called');
    console.log('[API] Address:', address);
    console.log('[API] Request body:', req.body);

    try {
        const result = await pool.query(`
            INSERT INTO creator_profiles (
                address, name, bio, avatar, type, location, 
                website, twitter, linkedin, focus_areas, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
            ON CONFLICT (address) 
            DO UPDATE SET
                name = EXCLUDED.name,
                bio = EXCLUDED.bio,
                avatar = EXCLUDED.avatar,
                type = EXCLUDED.type,
                location = EXCLUDED.location,
                website = EXCLUDED.website,
                twitter = EXCLUDED.twitter,
                linkedin = EXCLUDED.linkedin,
                focus_areas = EXCLUDED.focus_areas,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [address, name, bio, avatar, type, location, website, twitter, linkedin, JSON.stringify(focusAreas || [])]);

        const profile = result.rows[0];
        console.log('[API] Profile updated successfully:', profile.address);
        res.json({
            address: profile.address,
            name: profile.name,
            bio: profile.bio,
            avatar: profile.avatar,
            type: profile.type,
            location: profile.location,
            website: profile.website,
            twitter: profile.twitter,
            linkedin: profile.linkedin,
            focusAreas: profile.focus_areas || [],
            updatedAt: profile.updated_at
        });
    } catch (err) {
        console.error('[API] Error updating creator profile:', err);
        console.error('[API] Error details:', err.message);
        console.error('[API] Error stack:', err.stack);
        res.status(500).json({ error: err.message });
    }
});

// --- Creator Following Endpoints ---

/**
 * POST /api/creator/:address/follow
 * Follow a creator
 */
app.post('/api/creator/:address/follow', async (req, res) => {
    const { address } = req.params;
    const { followerAddress } = req.body;

    if (!followerAddress) {
        return res.status(400).json({ error: 'Follower address is required' });
    }

    try {
        await pool.query(
            'INSERT INTO creator_follows (follower_address, creator_address) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [followerAddress.toLowerCase(), address.toLowerCase()]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM creator_follows WHERE creator_address = $1',
            [address.toLowerCase()]
        );

        res.json({
            success: true,
            followerCount: parseInt(countResult.rows[0].count)
        });
    } catch (err) {
        console.error('[API] Error following creator:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/creator/:address/follow
 * Unfollow a creator
 */
app.delete('/api/creator/:address/follow', async (req, res) => {
    const { address } = req.params;
    const { followerAddress } = req.body;

    if (!followerAddress) {
        return res.status(400).json({ error: 'Follower address is required' });
    }

    try {
        await pool.query(
            'DELETE FROM creator_follows WHERE follower_address = $1 AND creator_address = $2',
            [followerAddress.toLowerCase(), address.toLowerCase()]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM creator_follows WHERE creator_address = $1',
            [address.toLowerCase()]
        );

        res.json({
            success: true,
            followerCount: parseInt(countResult.rows[0].count)
        });
    } catch (err) {
        console.error('[API] Error unfollowing creator:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/creator/:address/follow/status
 * Check if a user is following a creator
 */
app.get('/api/creator/:address/follow/status', async (req, res) => {
    const { address } = req.params;
    const { follower } = req.query;

    if (!follower) {
        return res.status(400).json({ error: 'Follower address is required' });
    }

    try {
        const result = await pool.query(
            'SELECT EXISTS(SELECT 1 FROM creator_follows WHERE follower_address = $1 AND creator_address = $2)',
            [follower.toLowerCase(), address.toLowerCase()]
        );

        res.json({
            isFollowing: result.rows[0].exists
        });
    } catch (err) {
        console.error('[API] Error checking follow status:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/creator/:address/followers/count
 * Get follower count for a creator
 */
app.get('/api/creator/:address/followers/count', async (req, res) => {
    const { address } = req.params;

    try {
        const result = await pool.query(
            'SELECT COUNT(*) FROM creator_follows WHERE creator_address = $1',
            [address.toLowerCase()]
        );

        res.json({
            count: parseInt(result.rows[0].count)
        });
    } catch (err) {
        console.error('[API] Error getting follower count:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/user/:address/following
 * Get list of creators a user is following
 */
app.get('/api/user/:address/following', async (req, res) => {
    const { address } = req.params;

    try {
        const result = await pool.query(`
            SELECT 
                cf.creator_address,
                cp.name,
                cp.avatar,
                cp.type,
                COUNT(DISTINCT e.campaign_id) as campaign_count
            FROM creator_follows cf
            LEFT JOIN creator_profiles cp ON cf.creator_address = cp.address
            LEFT JOIN events e ON LOWER(e.creator) = LOWER(cf.creator_address)
            WHERE cf.follower_address = $1
            GROUP BY cf.creator_address, cp.name, cp.avatar, cp.type
            ORDER BY cf.created_at DESC
        `, [address.toLowerCase()]);

        const following = result.rows.map(row => ({
            address: row.creator_address,
            name: row.name || `Creator ${row.creator_address.slice(0, 6)}`,
            avatar: row.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${row.creator_address}`,
            type: row.type || 'Individual',
            campaignCount: parseInt(row.campaign_count) || 0
        }));

        res.json({ following });
    } catch (err) {
        console.error('[API] Error getting following list:', err);
        res.status(500).json({ error: err.message });
    }
});

// Initialize Indexer with DB
initDb().then(() => {
    // Re-enabled indexer to support real-time dashboard stats/activity
    setInterval(syncEvents, 10000); // Scan every 10s
    console.log('[Indexer] Blockchain scanning active (10s interval).');
});

// --- BTC Automated Logic ---

/**
 * GET /api/btc/address/:campaignId
 * Returns a unique BTC address for a campaign.
 */
app.get('/api/btc/address/:campaignId', (req, res) => {
    const { campaignId } = req.params;
    try {
        const address = deriveCampaignBtcAddress(PLATFORM_XPUB, campaignId);
        res.json({ address, network: 'bitcoin' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/btc/sync
 * Mock endpoint to "detect" a BTC payment and sync to Sonic.
 * In production, this would be called by a webhook from BlockCypher/Alchemy.
 */
/**
 * POST /api/btc/sync
 * Oracle endpoint: Confirms a BTC deposit and records it on the Sonic blockchain.
 * This triggers 'recordExternalContribution' in the CampaignManager contract.
 */
app.post('/api/btc/sync', async (req, res) => {
    const { campaignId, txid, amountSats } = req.body;

    if (!campaignId || !amountSats) {
        return res.status(400).json({ error: 'Missing campaignId or amountSats' });
    }

    try {
        console.log(`[BTC-Sync] Verifying TX ${txid} for ${amountSats} sats...`);

        // 1. Mock Verification Logic
        // In reality: Check BTC Block Explorer API
        const verified = true;

        if (verified && oracleCampaignManager) {
            // 2. Convert sats to 18 decimals (S/ETH scale)
            // 1 BTC = 10^8 sats
            // 1 S = 10^18 wei
            // So: amountInWei = (amountSats / 10^8) * 10^18 = amountSats * 10^10
            const amountWei = BigInt(amountSats) * BigInt(10 ** 10);

            console.log(`[Sonic-Oracle] Recording contribution for ${campaignId}: ${amountWei.toString()} wei`);

            // 3. Call Sonic Contract
            const tx = await oracleCampaignManager.recordExternalContribution(campaignId, amountWei);
            await tx.wait();

            console.log(`[Sonic-Oracle] Successfully synced TX ${tx.hash}`);

            res.json({
                success: true,
                sonicTx: tx.hash,
                amountSynced: amountWei.toString()
            });
        } else {
            res.status(400).json({ error: 'Verification failed or Oracle not configured' });
        }
    } catch (error) {
        console.error('[BTC-Sync] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Campaign Comments Endpoints ---

/**
 * GET /api/campaigns/:campaignId/comments
 * Get all comments for a campaign
 */
/**
 * GET /api/campaigns/:campaignId/comments
 * Retrieves all community comments for a specific campaign.
 * Can be filtered by network (sonic/ethereum).
 */
app.get('/api/campaigns/:campaignId/comments', async (req, res) => {
    const { campaignId } = req.params;
    const { network } = req.query;

    try {
        let query = 'SELECT * FROM comments WHERE campaign_id = $1';
        let params = [campaignId.toLowerCase()];

        if (network) {
            query += ' AND network = $2';
            params.push(network.toString().toLowerCase());
        }

        query += ' ORDER BY time DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('[API] Error fetching comments:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/campaigns/:campaignId/comments
 * Add a new comment to a campaign
 */
/**
 * POST /api/campaigns/:campaignId/comments
 * Adds a new comment or reply to a campaign.
 * Automatically verifies if the author is the on-chain campaign creator.
 */
app.post('/api/campaigns/:campaignId/comments', async (req, res) => {
    const { campaignId } = req.params;
    const { userName, authorAddress, content, parentId } = req.body;

    if (!userName || !authorAddress || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    let isCreator = false;

    try {
        let isOnChainCreator = false;
        const internalId = campaignId.startsWith('0x') ? campaignId : `0x${campaignId}`;

        try {
            if (internalId && internalId.length === 66) {
                const sonicCampaign = await sonicCampaignManager.campaigns(internalId);
                if (sonicCampaign && sonicCampaign.creator && sonicCampaign.creator.toLowerCase() === authorAddress.toLowerCase()) {
                    isOnChainCreator = true;
                } else if (ethCampaignManager) {
                    const ethCampaign = await ethCampaignManager.campaigns(internalId);
                    if (ethCampaign && ethCampaign.creator && ethCampaign.creator.toLowerCase() === authorAddress.toLowerCase()) {
                        isOnChainCreator = true;
                    }
                }
            }
        } catch (e) {
            console.warn(`[Comments] RPC verification failed for ${campaignId}: ${e.message}`);
        }

        if (isOnChainCreator) {
            isCreator = true;
        }

        const result = await pool.query(
            'INSERT INTO comments (campaign_id, user_name, author_address, content, is_creator, parent_id, network) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [campaignId.toLowerCase(), userName || 'Anonymous', authorAddress.toLowerCase(), content, isCreator || false, parentId || null, req.body.network || 'sonic']
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('[API] Error adding comment:', err.message);
        console.error('[API] Stack:', err.stack);
        res.status(500).json({ error: err.message });
    }
});

// --- 5. Server Entry Point ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Sumsub Backend running on port ${PORT}`);
});
