import { useState, useEffect, useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { CAMPAIGN_MANAGER_ABI, CAMPAIGN_MANAGER_ADDRESS, CAMPAIGN_MANAGER_SEPOLIA_ADDRESS, APP_NETWORK, sonicBlaze } from '@/lib/abi';
import { formatEther, formatUnits } from 'viem';
import { mainnet, sonic, sepolia } from 'wagmi/chains';
import axios from 'axios';
import { SUPPORTED_TOKENS, getTokenBySymbol } from '@/lib/tokens';

export interface Campaign {
    id: number;
    internalId: string;
    slug: string;
    title: string;
    creator: string;
    image: string;
    raised: number;
    goal: number;
    currency: string;
    daysLeft: number;
    category: string;
    percentComplete: number;
    network: 'sonic' | 'ethereum' | 'btc';
    description?: string;
    totals?: { network: string; token: string; raised: string }[];
}

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')  // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
};

/**
 * Core hook for fetching and synchronizing campaign data across all supported networks.
 * Aggregates data from Sonic, Ethereum (Sepolia), and Bitcoin.
 * 
 * @returns Object containing merged campaigns, loading state, and refetch function.
 */
export const useCampaigns = () => {
    const [accurateStats, setAccurateStats] = useState<Record<string, any[]>>({});

    const activeSonicChain = APP_NETWORK === 'mainnet' ? sonic : sonicBlaze;
    const activeEthChain = APP_NETWORK === 'mainnet' ? mainnet : sepolia;

    // 1. Fetch from Sonic
    const { data: sonicRaw, isLoading: loadingSonic, refetch: refetchSonic } = useReadContract({
        address: CAMPAIGN_MANAGER_ADDRESS,
        abi: CAMPAIGN_MANAGER_ABI,
        functionName: 'getCampaigns',
        chainId: activeSonicChain.id,
        query: {
            refetchInterval: 10000, // Sync every 10s
        }
    });

    // 2. Fetch from Ethereum Sepolia
    const { data: ethRaw, isLoading: loadingEth, refetch: refetchEth } = useReadContract({
        address: CAMPAIGN_MANAGER_SEPOLIA_ADDRESS,
        abi: CAMPAIGN_MANAGER_ABI,
        functionName: 'getCampaigns',
        chainId: activeEthChain.id,
        query: {
            refetchInterval: 10000, // Sync every 10s
        }
    });



    /**
     * Maps raw blockchain data from multiple networks into a unified Campaign interface.
     * Handles decimal resolution, slug generation, and time calculation.
     * 
     * @param raw Raw campaign array from the smart contract.
     * @param network The originating network ('sonic' or 'ethereum').
     * @returns Array of mapped Campaign objects.
     */
    const mapCampaigns = (raw: any[] | undefined, network: 'sonic' | 'ethereum'): Campaign[] => {
        if (!raw) return [];
        return [...raw].map((c: any) => {
            const currency = c.currency || (network === 'sonic' ? 'S' : 'ETH');
            const tokenInfo = getTokenBySymbol(currency, network);
            const decimals = tokenInfo?.decimals || 18;

            const goal = parseFloat(formatUnits(c.goal, decimals));
            const internalId = c.internalId.toLowerCase();

            // Try to use accurate stats if available, otherwise fallback to contract pledged
            let raised = parseFloat(formatUnits(c.pledged, decimals));
            const totals = accurateStats[internalId];

            if (totals && totals.length > 0) {
                let totalRaised = 0;
                totals.forEach(t => {
                    // Search by address OR symbol
                    const tInfo = Object.values(SUPPORTED_TOKENS).find(
                        tk => tk.address.toLowerCase() === t.token.toLowerCase() ||
                            tk.symbol.toLowerCase() === t.token.toLowerCase()
                    );
                    const d = tInfo?.decimals || 18;
                    totalRaised += parseFloat(formatUnits(BigInt(t.raised), d));
                });
                raised = totalRaised;
            }

            const now = Math.floor(Date.now() / 1000);
            const endAt = Number(c.endAt);
            const daysLeft = Math.max(0, Math.ceil((endAt - now) / (24 * 60 * 60)));
            const percentComplete = Math.round((raised / goal) * 100);

            return {
                id: Number(c.id),
                internalId: c.internalId,
                slug: `${slugify(c.title)}-${c.internalId.slice(2, 8)}`,
                title: c.title,
                creator: c.creator,
                network: currency === 'BTC' ? 'btc' : network,
                image: c.image || 'https://images.unsplash.com/photo-1581321825824-1c7b379b62fd?auto=format&fit=crop&w=1470&q=80',
                raised,
                goal,
                currency,
                daysLeft,
                category: c.category || 'General',
                percentComplete,
                description: c.description,
                totals
            };
        });
    };

    const sonicCampaigns = useMemo(() => mapCampaigns(sonicRaw as any[], 'sonic'), [sonicRaw, accurateStats]);
    const ethCampaigns = useMemo(() => mapCampaigns(ethRaw as any[], 'ethereum'), [ethRaw, accurateStats]);

    // Merge and sort by ID (descending)
    const campaigns = useMemo(() => [...sonicCampaigns, ...ethCampaigns].sort((a, b) => b.id - a.id), [sonicCampaigns, ethCampaigns]);

    // 3. Fetch Real-time BTC Stats for BTC campaigns
    useEffect(() => {
        const btcCampaignIds = [...(sonicRaw || []), ...(ethRaw || [])]
            .filter((c: any) => c.currency === 'BTC')
            .map((c: any) => c.internalId);

        if (btcCampaignIds.length === 0) return;

        const fetchBtcStats = async () => {
            try {
                const response = await axios.post('http://localhost:3001/api/btc/stats/batch', {
                    campaignIds: btcCampaignIds
                });

                const newAccurateStats = { ...accurateStats };
                response.data.forEach((stat: any) => {
                    if (stat.totalReceivedBtc !== undefined) {
                        // Store as a pseudo-totals entry so the existing mapCampaigns logic picks it up
                        newAccurateStats[stat.internalId.toLowerCase()] = [{
                            network: 'bitcoin',
                            token: 'BTC',
                            raised: (BigInt(Math.floor(stat.totalReceivedBtc * 100000000))).toString()
                        }];
                    }
                });
                setAccurateStats(newAccurateStats);
            } catch (err) {
                console.error('[useCampaigns] BTC Batch Fetch Error:', err);
            }
        };

        fetchBtcStats();
        const interval = setInterval(fetchBtcStats, 30000);
        return () => clearInterval(interval);
    }, [sonicRaw, ethRaw]);

    // [CLEANSED] Backend stats fetching removed. 
    // We now rely solely on 'pledged' from the smart contract (sonicRaw/ethRaw).
    /*
    useEffect(() => {
        if (campaigns.length === 0) return;

        const fetchAccurateStats = async () => {
           ...
        };
        fetchAccurateStats();
    }, [sonicRaw, ethRaw]);
    */

    return {
        campaigns,
        isLoading: loadingSonic || loadingEth,
        error: null,
        refetch: () => {
            refetchSonic();
            refetchEth();
        }
    };
};
