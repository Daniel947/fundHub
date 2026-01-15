import { getAddress } from 'viem';
import { APP_NETWORK } from './abi';

/**
 * Metadata for a specific token supported by the platform.
 */
export interface TokenInfo {
    symbol: string;
    address: `0x${string}`;
    decimals: number;
    network: 'sonic' | 'ethereum' | 'btc';
    chainId?: number;
    logo?: string;
}

// Token sets for different environments
const TESTNET_TOKENS: Record<string, TokenInfo> = {
    'S': {
        symbol: 'S',
        address: getAddress('0x0000000000000000000000000000000000000000'),
        decimals: 18,
        network: 'sonic',
        chainId: 57054
    },
    'USDC_SONIC': {
        symbol: 'USDC',
        address: getAddress('0x29219Dd400f2bF9024c03AA174503Dd2330ca25c'),
        decimals: 6,
        network: 'sonic',
        chainId: 57054
    },
    'USDT_SONIC': {
        symbol: 'USDT',
        address: getAddress('0x05D8ca2F38F8FD5735163148483bCA750dBc5269'),
        decimals: 6,
        network: 'sonic',
        chainId: 57054
    },
    'WETH': {
        symbol: 'WETH',
        address: getAddress('0x76b509DC175C09f4a10C83A547CeF9e4C8FA4A0a'),
        decimals: 18,
        network: 'sonic',
        chainId: 57054
    },
    'USDC': {
        symbol: 'USDC',
        address: getAddress('0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'),
        decimals: 6,
        network: 'ethereum',
        chainId: 11155111
    },
    'ETH': {
        symbol: 'ETH',
        address: getAddress('0x0000000000000000000000000000000000000000'),
        decimals: 18,
        network: 'ethereum',
        chainId: 11155111
    },
    'USDT': {
        symbol: 'USDT',
        address: getAddress('0x8fE57961BE13EBDd2ED04ef57fC232f3532C88dB'),
        decimals: 6,
        network: 'ethereum',
        chainId: 11155111
    },
    'BTC': {
        symbol: 'BTC',
        address: getAddress('0x0000000000000000000000000000000000000000'),
        decimals: 8,
        network: 'btc'
    }
};

const MAINNET_TOKENS: Record<string, TokenInfo> = {
    'S': {
        symbol: 'S',
        address: getAddress('0x0000000000000000000000000000000000000000'),
        decimals: 18,
        network: 'sonic',
        chainId: 146 // Sonic Mainnet Chain ID
    },
    'USDC_SONIC': {
        symbol: 'USDC',
        address: getAddress('0x0000000000000000000000000000000000000000'), // Placeholder
        decimals: 6,
        network: 'sonic',
        chainId: 146
    },
    'USDC': {
        symbol: 'USDC',
        address: getAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'), // Ethereum Mainnet USDC
        decimals: 6,
        network: 'ethereum',
        chainId: 1
    },
    'ETH': {
        symbol: 'ETH',
        address: getAddress('0x0000000000000000000000000000000000000000'),
        decimals: 18,
        network: 'ethereum',
        chainId: 1
    },
    'BTC': {
        symbol: 'BTC',
        address: getAddress('0x0000000000000000000000000000000000000000'),
        decimals: 8,
        network: 'btc'
    }
};

export const SUPPORTED_TOKENS = APP_NETWORK === 'mainnet' ? MAINNET_TOKENS : TESTNET_TOKENS;

/**
 * Resolves a token's metadata based on its symbol and target network.
 * Handles environment-specific addresses (Testnet vs Mainnet).
 * 
 * @param symbol The token symbol (e.g., "USDC", "ETH").
 * @param network Optional target blockchain. If not provided, will search all networks.
 * @returns TokenInfo object or null if not found.
 */
export const getTokenBySymbol = (symbol: string, network?: 'sonic' | 'ethereum' | 'btc'): TokenInfo | null => {
    const s = symbol.toUpperCase();

    // 1. Try exact symbol match first
    if (SUPPORTED_TOKENS[s]) {
        // If network is specified, verify it matches
        if (network && SUPPORTED_TOKENS[s].network !== network) {
            // Continue to try with suffix
        } else {
            return SUPPORTED_TOKENS[s];
        }
    }

    // 2. Try with network suffix if specified
    if (network) {
        const netSuffix = network === 'ethereum' ? '_ETH' : network === 'sonic' ? '_SONIC' : '';
        if (netSuffix) {
            const keyWithSuffix = `${s}${netSuffix}`;
            if (SUPPORTED_TOKENS[keyWithSuffix]) return SUPPORTED_TOKENS[keyWithSuffix];
        }
    }

    // 3. Search through all tokens for a match
    const matchingToken = Object.values(SUPPORTED_TOKENS).find(token =>
        token.symbol === s && (!network || token.network === network)
    );

    if (matchingToken) return matchingToken;

    // 4. Fallback to native token based on network
    if (network === 'ethereum') return SUPPORTED_TOKENS['ETH'] || null;
    if (network === 'sonic') return SUPPORTED_TOKENS['S'] || null;

    return null;
};
