import { useState, useEffect } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import axios from 'axios';
import {
    CAMPAIGN_MANAGER_ABI,
    CAMPAIGN_MANAGER_ADDRESS,
    CAMPAIGN_MANAGER_SEPOLIA_ADDRESS,
    IDENTITY_REGISTRY_ABI,
    IDENTITY_REGISTRY_ADDRESS,
    FUND_ESCROW_ABI,
    FUND_ESCROW_ADDRESS,
    FUND_ESCROW_SEPOLIA_ADDRESS,
    APP_NETWORK,
    sonicBlaze
} from '@/lib/abi';
import { useCampaigns, Campaign } from './useCampaigns';
import { mainnet, sonic, sepolia } from 'wagmi/chains';

export interface Milestone {
    title: string;
    fundingPercentage: bigint;
    description: string;
    released: boolean;
}

export const useCampaignDetail = (slug: string | undefined) => {
    const { campaigns, isLoading: isLoadingList, refetch: refetchList } = useCampaigns();
    const [backerCount, setBackerCount] = useState(0);
    const [btcAddress, setBtcAddress] = useState<string | null>(null);

    // 1. Find the campaign in the list by slug
    const campaign = campaigns.find(c => c.slug === slug);

    // Fetch BTC address if applicable
    useEffect(() => {
        if (campaign?.currency === 'BTC' && campaign.internalId) {
            const fetchBtcAddress = async () => {
                try {
                    const response = await axios.get(`http://localhost:3001/api/btc/address/${campaign.internalId}`);
                    setBtcAddress(response.data.address);
                } catch (error) {
                    console.error('Error fetching BTC address:', error);
                }
            };
            fetchBtcAddress();
        }
    }, [campaign]);

    // Dynamic configuration based on campaign network
    const isEth = campaign?.network === 'ethereum';
    const activeEthChain = APP_NETWORK === 'mainnet' ? mainnet : sepolia;
    const activeSonicChain = APP_NETWORK === 'mainnet' ? sonic : sonicBlaze;

    const targetChainId = isEth ? activeEthChain.id : activeSonicChain.id;
    const campaignManagerAddr = isEth ? CAMPAIGN_MANAGER_SEPOLIA_ADDRESS : CAMPAIGN_MANAGER_ADDRESS;
    const fundEscrowAddr = isEth ? FUND_ESCROW_SEPOLIA_ADDRESS : FUND_ESCROW_ADDRESS;
    // Note: IdentityRegistry is currently only deployed on Sonic
    const identityRegistryAddr = IDENTITY_REGISTRY_ADDRESS;
    const identityChainId = activeSonicChain.id;

    // 2. Fetch from Sonic
    const { data: rawMilestones, isLoading: isLoadingMilestones, refetch: refetchMilestones } = useReadContract({
        address: campaignManagerAddr,
        abi: CAMPAIGN_MANAGER_ABI,
        functionName: 'getMilestones',
        args: campaign ? [campaign.internalId as `0x${string}`] : undefined,
        chainId: targetChainId,
        query: {
            enabled: !!campaign,
        }
    });

    // 3. Fetch creator verification status
    const { data: creatorVerified, isLoading: isLoadingIdentity } = useReadContract({
        address: identityRegistryAddr,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'isVerified',
        args: campaign ? [campaign.creator as `0x${string}`] : undefined,
        chainId: identityChainId, // Dynamic based on network
        query: {
            enabled: !!campaign,
        }
    });

    // 4. Fetch dynamic escrow status
    const { data: isEscrowLocked, isLoading: isLoadingEscrow } = useReadContract({
        address: fundEscrowAddr,
        abi: FUND_ESCROW_ABI,
        functionName: 'isCampaignRegistered',
        args: campaign ? [campaign.internalId as `0x${string}`] : undefined,
        chainId: targetChainId,
        query: {
            enabled: !!campaign,
        }
    });

    const milestones: Milestone[] = rawMilestones
        ? (rawMilestones as any[]).map(m => ({
            title: m.title,
            fundingPercentage: m.fundingPercentage,
            description: m.description,
            released: m.released
        }))
        : [];

    const [btcStats, setBtcStats] = useState<{ totalReceivedBtc: number, backers: any[] } | null>(null);

    // Fetch BTC stats (raised and backers) if applicable
    useEffect(() => {
        if (campaign?.currency === 'BTC' && btcAddress) {
            const fetchBtcStats = async () => {
                try {
                    const response = await axios.get(`http://localhost:3001/api/btc/monitor/${btcAddress}`);
                    setBtcStats(response.data);
                } catch (error) {
                    console.error('Error fetching BTC stats:', error);
                }
            };
            fetchBtcStats();
            const interval = setInterval(fetchBtcStats, 15000); // Poll every 15s
            return () => clearInterval(interval);
        }
    }, [campaign, btcAddress]);

    // 5. Fetch on-chain backer count
    const { data: onChainBackerCount, isLoading: isLoadingBackers, refetch: refetchBackerCount } = useReadContract({
        address: campaignManagerAddr,
        abi: CAMPAIGN_MANAGER_ABI,
        functionName: 'getBackerCount',
        args: campaign ? [campaign.internalId as `0x${string}`] : undefined,
        chainId: targetChainId,
        query: {
            enabled: !!campaign && campaign.currency !== 'BTC', // Don't fetch from Sonic for BTC
            refetchInterval: 30000
        }
    });

    // 6. Fetch on-chain backer list
    const { data: onChainBackers, refetch: refetchBackers } = useReadContract({
        address: campaignManagerAddr,
        abi: CAMPAIGN_MANAGER_ABI,
        functionName: 'getBackers',
        args: campaign ? [campaign.internalId as `0x${string}`] : undefined,
        chainId: targetChainId,
        query: {
            enabled: !!campaign && campaign.currency !== 'BTC',
            refetchInterval: 30000
        }
    });

    // 6.5 Fetch individual contribution amounts for each backer
    const backerAddresses = (onChainBackers as string[]) || [];
    const { data: contributionData, refetch: refetchContributions } = useReadContracts({
        contracts: backerAddresses.map(backer => ({
            address: campaignManagerAddr,
            abi: CAMPAIGN_MANAGER_ABI,
            functionName: 'getBackerContribution',
            args: [campaign?.internalId as `0x${string}`, backer],
            chainId: targetChainId,
        })),
        query: {
            enabled: !!campaign && backerAddresses.length > 0 && campaign.currency !== 'BTC',
        }
    });

    // Merge Backers: Use BTC stats for BTC, else use On-Chain
    const enrichedBackers = campaign?.currency === 'BTC'
        ? (btcStats?.backers || [])
        : backerAddresses.map((address, index) => ({
            address,
            amount: contributionData?.[index]?.result?.toString() || '0'
        }));

    useEffect(() => {
        if (campaign?.currency === 'BTC') {
            setBackerCount(btcStats?.backers.length || 0);
        } else if (onChainBackerCount !== undefined) {
            setBackerCount(Number(onChainBackerCount));
        }
    }, [onChainBackerCount, btcStats, campaign]);

    // 5. Calculate Dynamic Safety Score
    const calculateSafetyScore = () => {
        if (!campaign) return 0;

        let score = 0;

        // Factor 1: Identity Verification (40%)
        if (creatorVerified) score += 40;

        // Factor 2: Escrow Status (30%)
        if (isEscrowLocked) score += 30;

        // Factor 3: Milestone Granularity (20%)
        const milestoneCount = milestones.length;
        if (milestoneCount >= 4) score += 20;
        else if (milestoneCount >= 2) score += 10;
        else if (milestoneCount === 1) score += 5;

        // Factor 4: Transparency (10%)
        if (campaign.description.length > 200) score += 5;
        if (campaign.image && campaign.image.startsWith('http')) score += 5;

        return score;
    };

    const aiTrustScore = calculateSafetyScore();

    // 7. Calculate Real-Time Escrow Amounts
    const totalPledged = campaign?.currency === 'BTC' && btcStats
        ? btcStats.totalReceivedBtc
        : (campaign ? Number(campaign.raised) : 0);
    const totalGoal = campaign ? Number(campaign.goal) : 0;

    // Total released is sum of (goal * percentage) for released milestones
    const totalReleased = milestones
        .filter(m => m.released)
        .reduce((sum, m) => sum + (totalGoal * Number(m.fundingPercentage)) / 100, 0);

    const totalLockedInEscrow = Math.max(0, totalPledged - totalReleased);

    return {
        campaign,
        milestones,
        creatorVerified: !!creatorVerified,
        isEscrowLocked: !!isEscrowLocked,
        totalLockedInEscrow,
        totalPledged,
        aiTrustScore,
        backerCount,
        btcAddress,
        backers: enrichedBackers,
        isLoading: isLoadingList || isLoadingMilestones || isLoadingIdentity || isLoadingEscrow || isLoadingBackers,
        exists: !!campaign || isLoadingList,
        refetch: async () => {
            refetchList();
            await Promise.all([
                refetchMilestones(),
                refetchBackerCount(),
                refetchBackers(),
                refetchContributions()
            ]);
        }
    };
};
