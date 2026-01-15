import { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useCampaigns } from './useCampaigns';
import { formatEther } from 'viem';

interface CreatorProfileData {
    address: string;
    name: string;
    bio: string;
    avatar: string;
    type: 'Individual' | 'NGO' | 'Organization';
    location: string;
    yearsActive: number;
    website: string;
    twitter: string;
    linkedin: string;
    focusAreas: string[];

    // Calculated stats
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    totalRaised: string;
    totalReleased: string;
    totalRaisedUsd: number;
    totalReleasedUsd: number;
    totalRaisedByCurrency: Record<string, number>;
    totalReleasedByCurrency: Record<string, number>;
    totalBackers: number;
    successRate: number;
    trustScore: number;

    // Campaigns
    campaigns: any[];

    // Loading state
    isLoading: boolean;
    error: string | null;
}

export const useCreatorProfile = (creatorAddress: string) => {
    const { campaigns, isLoading: campaignsLoading } = useCampaigns();
    const [profileData, setProfileData] = useState<any>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch creator profile from backend
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoadingProfile(true);
                const response = await fetch(`http://localhost:3001/api/creator/${creatorAddress}`);

                if (response.ok) {
                    const data = await response.json();
                    setProfileData(data);
                } else {
                    // If profile doesn't exist in backend, use defaults
                    setProfileData({
                        name: `Creator ${creatorAddress.slice(0, 6)}`,
                        bio: '',
                        avatar: '',
                        type: 'Individual',
                        location: '',
                        website: '',
                        twitter: '',
                        linkedin: '',
                        focusAreas: []
                    });
                }
            } catch (err) {
                console.error('Error fetching creator profile:', err);
                // Use defaults on error
                setProfileData({
                    name: `Creator ${creatorAddress.slice(0, 6)}`,
                    bio: '',
                    avatar: '',
                    type: 'Individual',
                    location: '',
                    website: '',
                    twitter: '',
                    linkedin: '',
                    focusAreas: []
                });
            } finally {
                setIsLoadingProfile(false);
            }
        };

        if (creatorAddress) {
            fetchProfile();
        }
    }, [creatorAddress]);

    const [prices, setPrices] = useState<Record<string, number>>({
        'S': 0.85,    // Default fallback
        'ETH': 2500,  // Default fallback
        'BTC': 65000, // Default fallback
        'USDC': 1,
        'USDT': 1
    });

    // Fetch real-time prices
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                // S is not yet widely on CG price API by common name, using placeholder or approximate for now
                // Fetching ETH and BTC
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,sonic&vs_currencies=usd');
                if (response.ok) {
                    const data = await response.json();
                    setPrices(prev => ({
                        ...prev,
                        'ETH': data.ethereum?.usd || prev['ETH'],
                        'BTC': data.bitcoin?.usd || prev['BTC'],
                        'S': data.sonic?.usd || prev['S'] // Assuming 'sonic' is the ID on CG
                    }));
                }
            } catch (err) {
                console.warn('[useCreatorProfile] Failed to fetch prices, using defaults:', err);
            }
        };
        fetchPrices();
    }, []);

    // Filter campaigns by creator
    const creatorCampaigns = useMemo(() => {
        if (!campaigns || !creatorAddress) return [];
        return campaigns.filter(
            campaign => campaign.creator.toLowerCase() === creatorAddress.toLowerCase()
        );
    }, [campaigns, creatorAddress]);

    // Calculate statistics
    const stats = useMemo(() => {
        const totalCampaigns = creatorCampaigns.length;

        // Note: Campaign interface doesn't have isCompleted/isCancelled
        // A campaign is completed if: time ended OR goal reached
        const activeCampaigns = creatorCampaigns.filter(c => c.daysLeft > 0 && c.percentComplete < 100).length;
        const completedCampaigns = creatorCampaigns.filter(c => c.daysLeft === 0 || c.percentComplete >= 100).length;

        // Group raised amounts and released amounts by currency
        const totalRaisedByCurrency: Record<string, number> = {};
        const totalReleasedByCurrency: Record<string, number> = {};
        let totalRaisedUsd = 0;
        let totalReleasedUsd = 0;

        creatorCampaigns.forEach(campaign => {
            const currency = campaign.currency || 'S';
            const price = prices[currency] || 1;

            // Accumulated Raised
            totalRaisedByCurrency[currency] = (totalRaisedByCurrency[currency] || 0) + (campaign.raised || 0);
            totalRaisedUsd += (campaign.raised || 0) * price;

            // Accumulated Released (Withdrawn)
            // For now, estimate based on completed campaigns as in previous logic
            if (campaign.percentComplete >= 100) {
                totalReleasedByCurrency[currency] = (totalReleasedByCurrency[currency] || 0) + (campaign.raised || 0);
                totalReleasedUsd += (campaign.raised || 0) * price;
            } else {
                totalReleasedByCurrency[currency] = (totalReleasedByCurrency[currency] || 0) + 0;
            }
        });

        // Sum up raised amounts (Legacy support for single string if needed)
        const totalRaised = Object.values(totalRaisedByCurrency).reduce((sum, val) => sum + val, 0);
        const totalReleased = Object.values(totalReleasedByCurrency).reduce((sum, val) => sum + val, 0);

        // Calculate total backers from backend stats
        const totalBackers = creatorCampaigns.reduce((sum, campaign) => {
            const stats = (campaign as any).backerCount;
            return sum + (stats || 0);
        }, 0);

        const successRate = totalCampaigns > 0
            ? (completedCampaigns / totalCampaigns) * 100
            : 0;

        // Calculate trust score based on various factors
        const trustScore = calculateTrustScore({
            totalCampaigns,
            completedCampaigns,
            successRate,
            totalRaised: totalRaisedUsd, // Use USD for normalized trust score
            yearsActive: profileData?.yearsActive || 0
        });

        // Calculate years active from first campaign
        const yearsActive = creatorCampaigns.length > 0
            ? new Date().getFullYear() - 2020
            : 0;

        return {
            totalCampaigns,
            activeCampaigns,
            completedCampaigns,
            totalRaised: totalRaised.toFixed(4),
            totalReleased: totalReleased.toFixed(4),
            totalRaisedUsd,
            totalReleasedUsd,
            totalRaisedByCurrency,
            totalReleasedByCurrency,
            totalBackers,
            successRate: Math.round(successRate),
            trustScore,
            yearsActive
        };
    }, [creatorCampaigns, profileData, prices]);

    const data: CreatorProfileData = {
        address: creatorAddress,
        name: profileData?.name || `Creator ${creatorAddress.slice(0, 6)}`,
        bio: profileData?.bio || '',
        avatar: profileData?.avatar || '',
        type: profileData?.type || 'Individual',
        location: profileData?.location || '',
        yearsActive: stats.yearsActive,
        website: profileData?.website || '',
        twitter: profileData?.twitter || '',
        linkedin: profileData?.linkedin || '',
        focusAreas: profileData?.focusAreas || [],

        ...stats,

        campaigns: creatorCampaigns,
        isLoading: campaignsLoading || isLoadingProfile,
        error
    };

    return data;
};

// Helper function to calculate trust score
function calculateTrustScore(params: {
    totalCampaigns: number;
    completedCampaigns: number;
    successRate: number;
    totalRaised: number;
    yearsActive: number;
}): number {
    const { totalCampaigns, completedCampaigns, successRate, totalRaised, yearsActive } = params;

    let score = 0;

    // Campaign completion (40 points max)
    score += Math.min(completedCampaigns * 8, 40);

    // Success rate (30 points max)
    score += (successRate / 100) * 30;

    // Total raised (20 points max)
    score += Math.min(totalRaised / 10, 20);

    // Years active (10 points max)
    score += Math.min(yearsActive * 2, 10);

    return Math.min(Math.round(score), 100);
}
