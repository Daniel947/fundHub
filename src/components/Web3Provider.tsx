import React from 'react';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base, sonic, sonicTestnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { Chain } from 'viem';
import { APP_NETWORK, sonicBlaze } from '@/lib/abi';

// Determine active chains based on environment
const activeChains = APP_NETWORK === 'mainnet'
    ? [sonic, mainnet]
    : [sonicBlaze, sepolia];

const config = getDefaultConfig({
    appName: 'FundHub Impact Verse',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'dummy_id',
    chains: activeChains as any,
    ssr: false,
});

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
        mutations: {
            retry: 1,
        },
    },
});

interface Web3ProviderProps {
    children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
