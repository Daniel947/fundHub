import { useState, useEffect, useCallback } from 'react';
import { usePublicClient, useWatchContractEvent, useAccount } from 'wagmi';
import { FUND_ESCROW_ADDRESS, FUND_ESCROW_ABI, CAMPAIGN_MANAGER_ADDRESS, CAMPAIGN_MANAGER_ABI } from '@/lib/abi';
import { formatEther, parseAbiItem } from 'viem';
import { sonicBlaze } from '@/lib/abi';
import axios from 'axios';

export interface Backer {
    id: string;
    name: string;
    amount: number;
    currency: string;
    time: string;
    address: string;
    isTopBacker?: boolean;
    explorerUrl?: string;
    points?: number;
    badges?: Array<{ id: string; label: string; icon: string }>;
}

export interface ActivityEvent {
    id: string;
    type: 'donation' | 'milestone' | 'update' | 'creation';
    user?: string;
    content: string;
    time: string;
    amount?: number;
    currency?: string;
    explorerUrl?: string;
}

export interface Comment {
    id: string;
    campaignId: string;
    user: string;
    authorAddress: string;
    content: string;
    time: string;
    isCreator: boolean;
}

const API_BASE = 'http://localhost:3001/api';

export const useCommunityData = (campaignId: string | undefined, currency: string = 'S', creator: string = '') => {
    const { address: userAddress } = useAccount();
    const publicClient = usePublicClient();
    const [backers, setBackers] = useState<Backer[]>([]);
    const [activities, setActivities] = useState<ActivityEvent[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCommunityData = useCallback(async () => {
        if (!campaignId) return;

        try {
            const [activityRes, backersRes, commentsRes] = await Promise.all([
                axios.get(`${API_BASE}/activity/${campaignId}`),
                axios.get(`${API_BASE}/backers/${campaignId}`),
                axios.get(`${API_BASE}/comments/${campaignId}`)
            ]);

            // Map Backend Activity to ActivityEvent
            const mappedActivities: ActivityEvent[] = activityRes.data.map((e: any) => ({
                id: e.id,
                type: e.eventName === 'FundsLocked' ? 'donation' : (e.eventName === 'MilestoneReleased' ? 'milestone' : 'update'),
                user: e.args.donor ? `${e.args.donor.slice(0, 6)}...` : undefined,
                content: e.eventName === 'FundsLocked'
                    ? `${e.args.donor.slice(0, 6)}... supported the campaign!`
                    : (e.eventName === 'MilestoneReleased' ? `Milestone ${Number(e.args.milestoneIndex) + 1} Released!` : 'Campaign update'),
                time: e.time ? e.time : 'Recent',
                amount: e.args.amount ? parseFloat(formatEther(BigInt(e.args.amount))) : undefined,
                currency: currency, // Use the campaign's base currency
                explorerUrl: e.explorerUrl
            }));

            // Map Backend Backers
            const mappedBackers: Backer[] = backersRes.data.map((b: any) => ({
                id: b.address,
                name: `${b.address.slice(0, 6)}...${b.address.slice(-4)}`,
                address: b.address,
                amount: parseFloat(formatEther(BigInt(b.totalAmount))),
                currency: currency, // Use the campaign's base currency
                time: b.time || 'Verified',
                explorerUrl: b.explorerUrl,
                points: b.points,
                badges: b.badges
            }));

            // Map Backend Comments (SQL snake_case to Frontend camelCase)
            const mappedComments: Comment[] = commentsRes.data.map((c: any) => ({
                id: c.id.toString(),
                campaignId: c.campaign_id,
                user: c.user_name,
                authorAddress: c.author_address,
                content: c.content,
                time: c.time,
                isCreator: c.is_creator
            }));

            setActivities(mappedActivities);
            setBackers(mappedBackers);
            setComments(mappedComments);
        } catch (err) {
            console.error('Error fetching community data from backend:', err);
        }
    }, [campaignId]);

    useEffect(() => {
        if (campaignId) {
            setIsLoading(true);
            fetchCommunityData().finally(() => setIsLoading(false));
        }
    }, [campaignId, fetchCommunityData]);

    // Watch for live donations
    useWatchContractEvent({
        address: FUND_ESCROW_ADDRESS,
        abi: FUND_ESCROW_ABI,
        eventName: 'FundsLocked',
        onLogs(logs) {
            const filteredLogs = logs.filter((log: any) => log.args.id === campaignId);
            if (filteredLogs.length > 0) {
                fetchCommunityData(); // Easiest way to refresh all
            }
        },
    });

    const postComment = async (content: string) => {
        if (!campaignId || !content) {
            console.error('Missing campaignId or content for comment posting');
            return;
        }
        try {
            const isCreator = userAddress?.toLowerCase() === creator.toLowerCase();
            const payload = {
                campaignId,
                user: userAddress ? `${userAddress.slice(0, 6)}...` : 'Anonymous',
                authorAddress: userAddress || '0x000',
                content,
                isCreator
            };

            console.log('Posting comment to:', `${API_BASE}/comments`, payload);

            const res = await axios.post(`${API_BASE}/comments`, payload);
            const newCommentMapped: Comment = {
                id: res.data.id.toString(),
                campaignId: res.data.campaign_id,
                user: res.data.user_name,
                authorAddress: res.data.author_address,
                content: res.data.content,
                time: res.data.time,
                isCreator: res.data.is_creator
            };
            setComments(prev => [newCommentMapped, ...prev]);
            return newCommentMapped;
        } catch (err: any) {
            console.error('Error posting comment:', err.message, err.response?.data);
            throw new Error(err.response?.data?.error || 'Failed to post comment. Is the server running?');
        }
    };

    return {
        backers,
        activities,
        comments,
        isLoading,
        postComment,
        userAddress
    };
};
