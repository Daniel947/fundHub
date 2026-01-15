import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';

const bip32 = BIP32Factory(ecc);

/**
 * Derives a deterministic BTC address for a campaign based on its internalId.
 * We use the internalId as a salt to derive a child node from the platform xPub.
 */
export function deriveCampaignBtcAddress(xpub, internalId) {
    if (!xpub) {
        throw new Error('Platform xPub not configured');
    }

    const networkType = process.env.BTC_NETWORK || 'mainnet';
    const network = networkType === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

    try {
        // Convert internalId (hex string) to a number index or a buffer for path derivation
        const hash = crypto.createHash('sha256').update(internalId).digest();
        const index = hash.readUInt32BE(0) % 0x80000000; // Ensure it's not hardened

        // IMPORTANT: fromBase58 will throw if xpub version doesn't match network
        const node = bip32.fromBase58(xpub, network);
        const child = node.derive(0).derive(index); // m/0/index

        const { address } = bitcoin.payments.p2wpkh({
            pubkey: child.publicKey,
            network: network
        });

        return address;
    } catch (err) {
        console.error('[BTC] Derivation Error:', err.message);
        throw new Error(`BTC address derivation failed: ${err.message}. Check if your PLATFORM_XPUB matches the ${networkType} network.`);
    }
}

/**
 * For demonstration: Generates a random xPub if one doesn't exist.
 * In production, this should be pre-configured and kept secure.
 */
export function generatePlatformXPub() {
    const networkType = process.env.BTC_NETWORK || 'mainnet';
    const network = networkType === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

    const seed = crypto.randomBytes(64);
    const root = bip32.fromSeed(seed, network);
    return root.neutered().toBase58();
}
