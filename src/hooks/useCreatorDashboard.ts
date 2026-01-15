import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { useCampaigns, Campaign } from './useCampaigns';

export interface CurrencyTotal {
    network: string;
    token: string;
    raised: string;
}

export interface CreatorStats {
    totals: CurrencyTotal[];
    totalBackers: number;
    campaignCount: number;
}

export interface CreatorActivity {
    id: string;
    eventName: string;
    args: any;
    time: string;
    network: string;
    transactionHash: string;
}

export const useCreatorDashboard = () => {
    const { address } = useAccount();
    const { campaigns, isLoading: loadingCampaigns } = useCampaigns();
    const [stats, setStats] = useState<CreatorStats>({
        totals: [],
        totalBackers: 0,
        campaignCount: 0
    });
    const [activities, setActivities] = useState<CreatorActivity[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const creatorCampaigns = campaigns.filter(
        c => c.creator.toLowerCase() === address?.toLowerCase()
    );

    useEffect(() => {
        if (!address) return;

        const fetchData = async () => {
            try {
                const [statsRes, activityRes, profileRes] = await Promise.all([
                    axios.get(`http://localhost:3001/api/creator/${address}/stats`),
                    axios.get(`http://localhost:3001/api/creator/${address}/activity`),
                    axios.get(`http://localhost:3001/api/creator/${address}`).catch(() => ({ data: null }))
                ]);

                setStats(statsRes.data);
                setActivities(activityRes.data);
                setProfile(profileRes.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 15000); // Refresh every 15s

        return () => clearInterval(interval);
    }, [address]);

    return {
        campaigns: creatorCampaigns,
        stats,
        activities,
        profile,
        isLoading: isLoading || loadingCampaigns,
        address
    };
};
