import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import axios from 'axios';

export interface Badge {
    id: string;
    label: string;
    icon: string;
    awardedAt: string;
}

export interface UserRewards {
    points: number;
    badges: Badge[];
}

const API_BASE = 'http://localhost:3001/api';

export const useUserRewards = () => {
    const { address, isConnected } = useAccount();
    const [rewards, setRewards] = useState<UserRewards>({ points: 0, badges: [] });
    const [isLoading, setIsLoading] = useState(false);

    const fetchRewards = useCallback(async () => {
        if (!address || !isConnected) return;

        setIsLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/rewards/${address.toLowerCase()}`);
            setRewards({
                points: Number(res.data.points || 0),
                badges: res.data.badges || []
            });
        } catch (err) {
            console.error('Error fetching user rewards:', err);
        } finally {
            setIsLoading(false);
        }
    }, [address, isConnected]);

    useEffect(() => {
        fetchRewards();

        // Refresh every 30s to catch indexing updates
        const interval = setInterval(fetchRewards, 30000);
        return () => clearInterval(interval);
    }, [fetchRewards]);

    return {
        rewards,
        isLoading,
        refresh: fetchRewards
    };
};
